// payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, UserEntity])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
