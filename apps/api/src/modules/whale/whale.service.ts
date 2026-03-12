import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { WhaleTransactionEntity } from '../../database/entities/whale-transaction.entity';

@Injectable()
export class WhaleService {
  private readonly logger = new Logger(WhaleService.name);

  constructor(
    @InjectRepository(WhaleTransactionEntity)
    private whaleRepo: Repository<WhaleTransactionEntity>,
    private config: ConfigService,
  ) {}

  async getTransactions(symbol?: string, minUsd = 500000, limit = 50) {
    const query = this.whaleRepo.createQueryBuilder('w')
      .where('w.amountUsd >= :minUsd', { minUsd })
      .orderBy('w.timestamp', 'DESC')
      .limit(limit);

    if (symbol) {
      query.andWhere('UPPER(w.symbol) = :symbol', { symbol: symbol.toUpperCase() });
    }

    return query.getMany();
  }

  async getStats() {
    const last24h = new Date(Date.now() - 86400000);
    const result = await this.whaleRepo
      .createQueryBuilder('w')
      .select([
        'COUNT(*) as count',
        'SUM(w.amountUsd) as totalUsd',
        'w.symbol',
      ])
      .where('w.timestamp >= :last24h', { last24h })
      .andWhere('w.amountUsd >= 500000')
      .groupBy('w.symbol')
      .orderBy('totalUsd', 'DESC')
      .limit(10)
      .getRawMany();

    return result;
  }

  @Cron('*/5 * * * *')
  async crawlWhaleAlerts() {
    try {
      const apiKey = this.config.get('WHALE_ALERT_API_KEY');
      if (!apiKey) return;

      const since = Math.floor((Date.now() - 600000) / 1000); // last 10 min
      const { data } = await axios.get('https://api.whale-alert.io/v1/transactions', {
        params: { api_key: apiKey, min_value: 500000, start: since },
        timeout: 10000,
      });

      for (const tx of (data.transactions || [])) {
        await this.whaleRepo.upsert({
          id: tx.id.toString(),
          blockchain: tx.blockchain,
          symbol: tx.symbol.toUpperCase(),
          amount: tx.amount,
          amountUsd: tx.amount_usd,
          from: { address: tx.from?.address, owner: tx.from?.owner, ownerType: tx.from?.owner_type },
          to: { address: tx.to?.address, owner: tx.to?.owner, ownerType: tx.to?.owner_type },
          transactionType: this.classifyTransaction(tx),
          hash: tx.hash,
          timestamp: new Date(tx.timestamp * 1000),
        }, ['id']);
      }

      this.logger.log(`Crawled ${data.transactions?.length || 0} whale transactions`);
    } catch (err) {
      this.logger.error('Whale crawl failed:', err.message);
    }
  }

  private classifyTransaction(tx: any): string {
    const fromType = tx.from?.owner_type;
    const toType = tx.to?.owner_type;
    if (toType === 'exchange') return 'exchange_in';
    if (fromType === 'exchange') return 'exchange_out';
    if (tx.amount_usd === 0) return 'mint';
    return 'transfer';
  }
}
