import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('portfolio_holdings')
@Index(['userId', 'coinId'])
export class PortfolioHoldingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (u) => u.holdings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  coinId: string; // e.g. 'bitcoin'

  @Column()
  coinSymbol: string; // e.g. 'BTC'

  @Column()
  coinName: string; // e.g. 'Bitcoin'

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column('decimal', { precision: 20, scale: 8 })
  buyPrice: number; // USD

  @Column({ type: 'date', nullable: true })
  buyDate: string;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
