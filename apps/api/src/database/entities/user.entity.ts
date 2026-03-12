import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index,
} from 'typeorm';
import { PortfolioHoldingEntity } from './portfolio-holding.entity';
import { PriceAlertEntity } from './price-alert.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'free' })
  plan: 'free' | 'pro';

  @Column({ nullable: true })
  planExpiresAt: Date;

  @Column({ nullable: true })
  telegramChatId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerifyToken: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @OneToMany(() => PortfolioHoldingEntity, (h) => h.user)
  holdings: PortfolioHoldingEntity[];

  @OneToMany(() => PriceAlertEntity, (a) => a.user)
  alerts: PriceAlertEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
