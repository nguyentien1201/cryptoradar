import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('price_alerts')
export class PriceAlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (u) => u.alerts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  coinId: string;

  @Column()
  coinSymbol: string;

  @Column()
  condition: 'above' | 'below' | 'percent_change_up' | 'percent_change_down';

  @Column('decimal', { precision: 20, scale: 8 })
  targetPrice: number;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  percentChange: number;

  @Column('simple-array', { default: 'email' })
  channels: string[]; // 'email' | 'telegram'

  @Column({ default: 'active' })
  status: 'active' | 'triggered' | 'paused';

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  triggeredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
