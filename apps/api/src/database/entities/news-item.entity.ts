// news-item.entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('news_items')
export class NewsItemEntity {
  @PrimaryColumn()
  id: number;

  @Column('text')
  title: string;

  @Column()
  url: string;

  @Column()
  source: string;

  @Column()
  publishedAt: Date;

  @Column({ default: 'neutral' })
  sentiment: string;

  @Column('jsonb', { nullable: true })
  votes: object;

  @Column('simple-array', { nullable: true })
  currencies: string[];

  @CreateDateColumn()
  createdAt: Date;
}
