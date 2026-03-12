// portfolio.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioHoldingEntity } from '../../database/entities/portfolio-holding.entity';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PricesModule } from '../prices/prices.module';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioHoldingEntity]), PricesModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
