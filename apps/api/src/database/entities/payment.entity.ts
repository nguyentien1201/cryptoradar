import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  provider: 'stripe' | 'momo' | 'vnpay';

  @Column({ nullable: true })
  externalId: string; // Stripe payment intent / MoMo orderId

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column({ default: 'pro_monthly' })
  planType: string;

  @Column('jsonb', { nullable: true })
  metadata: object;

  @CreateDateColumn()
  createdAt: Date;
}
