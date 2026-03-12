import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron } from '@nestjs/schedule';
import { PriceAlertEntity } from '../../database/entities/price-alert.entity';
import { PricesService } from '../prices/prices.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PLAN_LIMITS } from '@cryptoradar/shared';
import { Logger } from '@nestjs/common';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(PriceAlertEntity)
    private alertRepo: Repository<PriceAlertEntity>,
    @InjectQueue('alerts') private alertQueue: Queue,
    private pricesService: PricesService,
    private notificationsService: NotificationsService,
  ) {}

  async getAlerts(userId: string) {
    return this.alertRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async createAlert(userId: string, plan: 'free' | 'pro', dto: any) {
    const count = await this.alertRepo.count({ where: { userId, status: 'active' } });
    const limit = PLAN_LIMITS[plan].maxAlerts;

    if (count >= limit) {
      throw new ForbiddenException(
        `Gói Free chỉ cho phép ${limit} cảnh báo. Nâng cấp Pro để tạo không giới hạn.`
      );
    }

    const alert = this.alertRepo.create({ userId, ...dto });
    return this.alertRepo.save(alert);
  }

  async deleteAlert(userId: string, id: string) {
    const alert = await this.alertRepo.findOne({ where: { id, userId } });
    if (!alert) throw new NotFoundException('Không tìm thấy alert');
    await this.alertRepo.remove(alert);
    return { success: true };
  }

  async toggleAlert(userId: string, id: string) {
    const alert = await this.alertRepo.findOne({ where: { id, userId } });
    if (!alert) throw new NotFoundException('Không tìm thấy alert');
    alert.status = alert.status === 'active' ? 'paused' : 'active';
    return this.alertRepo.save(alert);
  }

  // Check all active alerts every 2 minutes
  @Cron('*/2 * * * *')
  async checkAlerts() {
    const activeAlerts = await this.alertRepo.find({ where: { status: 'active' } });
    if (!activeAlerts.length) return;

    const coinIds = [...new Set(activeAlerts.map((a) => a.coinId))];
    const prices = await this.pricesService.getPricesByIds(coinIds);

    for (const alert of activeAlerts) {
      const priceData = prices[alert.coinId];
      if (!priceData) continue;

      const currentPrice = priceData.usd;
      let triggered = false;

      if (alert.condition === 'above' && currentPrice >= Number(alert.targetPrice)) triggered = true;
      if (alert.condition === 'below' && currentPrice <= Number(alert.targetPrice)) triggered = true;
      if (alert.condition === 'percent_change_up' && priceData.usd_24h_change >= Number(alert.percentChange)) triggered = true;
      if (alert.condition === 'percent_change_down' && priceData.usd_24h_change <= -Number(alert.percentChange)) triggered = true;

      if (triggered) {
        await this.alertQueue.add('send-alert', {
          alert,
          currentPrice,
          change24h: priceData.usd_24h_change,
        });

        await this.alertRepo.update(alert.id, {
          status: 'triggered',
          triggeredAt: new Date(),
        });

        this.logger.log(`Alert triggered: ${alert.coinSymbol} ${alert.condition} ${alert.targetPrice}`);
      }
    }
  }
}
