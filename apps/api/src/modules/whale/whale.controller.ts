// whale.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhaleService } from './whale.service';

@ApiTags('Whale')
@Controller('whale')
export class WhaleController {
  constructor(private whaleService: WhaleService) {}

  @Get()
  getTransactions(
    @Query('symbol') symbol?: string,
    @Query('minUsd') minUsd = 500000,
    @Query('limit') limit = 50,
  ) {
    return this.whaleService.getTransactions(symbol, +minUsd, +limit);
  }

  @Get('stats')
  getStats() {
    return this.whaleService.getStats();
  }
}
