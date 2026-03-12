// whale-transaction.entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('whale_transactions')
export class WhaleTransactionEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  blockchain: string;

  @Column()
  symbol: string;

  @Column('decimal', { precision: 30, scale: 8 })
  amount: number;

  @Column('decimal', { precision: 20, scale: 2 })
  amountUsd: number;

  @Column('jsonb')
  from: object;

  @Column('jsonb')
  to: object;

  @Column()
  transactionType: string;

  @Column()
  hash: string;

  @Column()
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
