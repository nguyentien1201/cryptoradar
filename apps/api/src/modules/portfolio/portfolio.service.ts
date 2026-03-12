import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioHoldingEntity } from '../../database/entities/portfolio-holding.entity';
import { PricesService } from '../prices/prices.service';
import { PLAN_LIMITS } from '@cryptoradar/shared';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioHoldingEntity)
    private holdingRepo: Repository<PortfolioHoldingEntity>,
    private pricesService: PricesService,
  ) {}

  async getHoldings(userId: string) {
    return this.holdingRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async addHolding(
    userId: string,
    userPlan: 'free' | 'pro',
    dto: { coinId: string; coinSymbol: string; coinName: string; amount: number; buyPrice: number; buyDate?: string; note?: string },
  ) {
    // Check plan limits
    const count = await this.holdingRepo.count({ where: { userId } });
    const limit = PLAN_LIMITS[userPlan].maxHoldings;
    if (count >= limit) {
      throw new ForbiddenException(`Gói ${userPlan} chỉ cho phép tối đa ${limit} holdings. Nâng cấp Pro để thêm không giới hạn.`);
    }

    const holding = this.holdingRepo.create({ userId, ...dto });
    return this.holdingRepo.save(holding);
  }

  async updateHolding(userId: string, id: string, dto: Partial<PortfolioHoldingEntity>) {
    const holding = await this.holdingRepo.findOne({ where: { id, userId } });
    if (!holding) throw new NotFoundException('Không tìm thấy holding');
    Object.assign(holding, dto);
    return this.holdingRepo.save(holding);
  }

  async deleteHolding(userId: string, id: string) {
    const holding = await this.holdingRepo.findOne({ where: { id, userId } });
    if (!holding) throw new NotFoundException('Không tìm thấy holding');
    await this.holdingRepo.remove(holding);
    return { success: true };
  }

  async getStats(userId: string) {
    const holdings = await this.getHoldings(userId);
    if (!holdings.length) {
      return { totalValue: 0, totalCost: 0, totalPnl: 0, totalPnlPercent: 0, allocation: [], holdings: [] };
    }

    const coinIds = [...new Set(holdings.map((h) => h.coinId))];
    const prices = await this.pricesService.getPricesByIds(coinIds);

    const enriched = holdings.map((h) => {
      const currentPrice = prices[h.coinId]?.usd || h.buyPrice;
      const currentValue = currentPrice * Number(h.amount);
      const cost = Number(h.buyPrice) * Number(h.amount);
      const pnl = currentValue - cost;
      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
      return { ...h, currentPrice, currentValue, cost, pnl, pnlPercent };
    });

    const totalValue = enriched.reduce((s, h) => s + h.currentValue, 0);
    const totalCost = enriched.reduce((s, h) => s + h.cost, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    // Allocation
    const allocationMap: Record<string, number> = {};
    enriched.forEach((h) => {
      allocationMap[h.coinSymbol] = (allocationMap[h.coinSymbol] || 0) + h.currentValue;
    });
    const allocation = Object.entries(allocationMap).map(([symbol, value]) => ({
      symbol,
      value,
      percent: totalValue > 0 ? (value / totalValue) * 100 : 0,
    })).sort((a, b) => b.value - a.value);

    const sorted = [...enriched].sort((a, b) => b.pnlPercent - a.pnlPercent);

    return {
      totalValue,
      totalCost,
      totalPnl,
      totalPnlPercent,
      allocation,
      bestPerformer: sorted[0] ? { symbol: sorted[0].coinSymbol, pnlPercent: sorted[0].pnlPercent } : null,
      worstPerformer: sorted[sorted.length - 1] ? { symbol: sorted[sorted.length - 1].coinSymbol, pnlPercent: sorted[sorted.length - 1].pnlPercent } : null,
      holdings: enriched,
    };
  }
}
