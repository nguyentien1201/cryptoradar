// whale.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhaleTransactionEntity } from '../../database/entities/whale-transaction.entity';
import { WhaleService } from './whale.service';
import { WhaleController } from './whale.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WhaleTransactionEntity])],
  providers: [WhaleService],
  controllers: [WhaleController],
  exports: [WhaleService],
})
export class WhaleModule {}
