import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PricesService } from './prices.service';

@ApiTags('Prices')
@Controller('prices')
export class PricesController {
  constructor(private pricesService: PricesService) {}

  @Get('market')
  getMarket(@Query('page') page = 1, @Query('per_page') perPage = 50) {
    return this.pricesService.getMarketData(+page, +perPage);
  }

  @Get('global')
  getGlobal() {
    return this.pricesService.getGlobalData();
  }

  @Get(':coinId')
  getCoin(@Param('coinId') coinId: string) {
    return this.pricesService.getCoinDetail(coinId);
  }
}
