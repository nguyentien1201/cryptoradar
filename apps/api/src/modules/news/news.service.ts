import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { NewsItemEntity } from '../../database/entities/news-item.entity';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(NewsItemEntity)
    private newsRepo: Repository<NewsItemEntity>,
    private config: ConfigService,
  ) {}

  async getNews(filter?: string, coins?: string) {
    const query = this.newsRepo.createQueryBuilder('n').orderBy('n.publishedAt', 'DESC').limit(50);

    if (filter && filter !== 'all') {
      query.where('n.sentiment = :filter', { filter });
    }

    if (coins) {
      const coinList = coins.split(',').map((c) => c.toUpperCase());
      query.andWhere('n.currencies && :coins', { coins: coinList });
    }

    return query.getMany();
  }

  async getFearGreed() {
    try {
      const { data } = await axios.get('https://api.alternative.me/fng/?limit=7');
      return data.data.map((d: any) => ({
        value: parseInt(d.value),
        classification: d.value_classification,
        timestamp: new Date(parseInt(d.timestamp) * 1000).toISOString(),
      }));
    } catch {
      return [{ value: 50, classification: 'Neutral', timestamp: new Date().toISOString() }];
    }
  }

  // Crawl news every 10 minutes
  @Cron('*/10 * * * *')
  async crawlNews() {
    try {
      const apiKey = this.config.get('CRYPTOPANIC_API_KEY');
      const { data } = await axios.get('https://cryptopanic.com/api/v1/posts/', {
        params: {
          auth_token: apiKey,
          public: true,
          filter: 'hot',
          metadata: true,
        },
        timeout: 10000,
      });

      const items = data.results || [];

      for (const item of items) {
        const sentiment = this.scoreSentiment(item);
        await this.newsRepo.upsert({
          id: item.id,
          title: item.title,
          url: item.url,
          source: item.source?.title || 'Unknown',
          publishedAt: new Date(item.published_at),
          sentiment,
          votes: item.votes,
          currencies: item.currencies?.map((c: any) => c.code) || [],
        }, ['id']);
      }

      this.logger.log(`Crawled ${items.length} news items`);
    } catch (err) {
      this.logger.error('News crawl failed:', err.message);
    }
  }

  private scoreSentiment(item: any): string {
    const votes = item.votes || {};
    const pos = (votes.positive || 0) + (votes.liked || 0);
    const neg = (votes.negative || 0) + (votes.disliked || 0);
    const total = pos + neg;

    if (item.kind === 'news' && item.metadata?.title) {
      const title = (item.title || '').toLowerCase();
      const bullishWords = ['surge', 'rally', 'bull', 'breakout', 'ath', 'gain', 'tăng', 'phá vỡ'];
      const bearishWords = ['crash', 'dump', 'bear', 'ban', 'hack', 'fall', 'drop', 'giảm', 'cấm'];
      const hasBullish = bullishWords.some(w => title.includes(w));
      const hasBearish = bearishWords.some(w => title.includes(w));
      if (hasBullish && !hasBearish) return 'bullish';
      if (hasBearish && !hasBullish) return 'bearish';
    }

    if (total === 0) return 'neutral';
    const ratio = pos / total;
    if (ratio > 0.6) return 'bullish';
    if (ratio < 0.4) return 'bearish';
    return 'neutral';
  }
}
