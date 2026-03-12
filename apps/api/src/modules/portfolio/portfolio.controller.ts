import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortfolioService } from './portfolio.service';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

class AddHoldingDto {
  @IsString() coinId: string;
  @IsString() coinSymbol: string;
  @IsString() coinName: string;
  @IsNumber() @Min(0) amount: number;
  @IsNumber() @Min(0) buyPrice: number;
  @IsOptional() @IsDateString() buyDate?: string;
  @IsOptional() @IsString() note?: string;
}

class UpdateHoldingDto {
  @IsOptional() @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsNumber() @Min(0) buyPrice?: number;
  @IsOptional() @IsDateString() buyDate?: string;
  @IsOptional() @IsString() note?: string;
}

@ApiTags('Portfolio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get()
  getHoldings(@Request() req) {
    return this.portfolioService.getHoldings(req.user.id);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.portfolioService.getStats(req.user.id);
  }

  @Post()
  addHolding(@Request() req, @Body() dto: AddHoldingDto) {
    return this.portfolioService.addHolding(req.user.id, req.user.plan, dto);
  }

  @Put(':id')
  updateHolding(@Request() req, @Param('id') id: string, @Body() dto: UpdateHoldingDto) {
    return this.portfolioService.updateHolding(req.user.id, id, dto);
  }

  @Delete(':id')
  deleteHolding(@Request() req, @Param('id') id: string) {
    return this.portfolioService.deleteHolding(req.user.id, id);
  }
}
