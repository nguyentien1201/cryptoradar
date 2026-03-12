import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createClient } from 'redis';
import axios from 'axios';

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);
  private redis: ReturnType<typeof createClient>;
  private readonly CACHE_TTL = 60; // seconds
  private readonly COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

  constructor(private config: ConfigService) {
    this.redis = createClient({ url: config.get('REDIS_URL') || 'redis://localhost:6379' });
    this.redis.connect().catch(console.error);
  }

  async getPricesByIds(coinIds: string[]): Promise<Record<string, { usd: number; usd_24h_change: number }>> {
    const cacheKey = `prices:${coinIds.sort().join(',')}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    try {
      const ids = coinIds.join(',');
      const { data } = await axios.get(`${this.COINGECKO_BASE}/simple/price`, {
        params: {
          ids,
          vs_currencies: 'usd',
          include_24hr_change: true,
          x_cg_demo_api_key: this.config.get('COINGECKO_API_KEY'),
        },
        timeout: 8000,
      });

      await this.redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(data));
      return data;
    } catch (err) {
      this.logger.error('CoinGecko API error:', err.message);
      return {};
    }
  }

  async getMarketData(page = 1, perPage = 50) {
    const cacheKey = `market:${page}:${perPage}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    const { data } = await axios.get(`${this.COINGECKO_BASE}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page,
        sparkline: true,
        price_change_percentage: '1h,24h,7d',
        x_cg_demo_api_key: this.config.get('COINGECKO_API_KEY'),
      },
      timeout: 10000,
    });

    await this.redis.setEx(cacheKey, 90, JSON.stringify(data));
    return data;
  }

  async getCoinDetail(coinId: string) {
    const cacheKey = `coin:${coinId}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    const { data } = await axios.get(`${this.COINGECKO_BASE}/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: true,
      },
      timeout: 10000,
    });

    await this.redis.setEx(cacheKey, 120, JSON.stringify(data));
    return data;
  }

  async getGlobalData() {
    const cacheKey = 'global';
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    const { data } = await axios.get(`${this.COINGECKO_BASE}/global`);
    await this.redis.setEx(cacheKey, 120, JSON.stringify(data.data));
    return data.data;
  }

  // Warm cache every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async warmPriceCache() {
    try {
      await this.getMarketData(1, 50);
      this.logger.debug('Price cache warmed');
    } catch (err) {
      this.logger.error('Cache warm failed:', err.message);
    }
  }
}
