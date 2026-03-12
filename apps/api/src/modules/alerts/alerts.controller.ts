import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { IsString, IsNumber, IsOptional, IsArray, IsIn, Min } from 'class-validator';

class CreateAlertDto {
  @IsString() coinId: string;
  @IsString() coinSymbol: string;
  @IsIn(['above', 'below', 'percent_change_up', 'percent_change_down'])
  condition: string;
  @IsNumber() @Min(0) targetPrice: number;
  @IsOptional() @IsNumber() percentChange?: number;
  @IsArray() channels: string[];
  @IsOptional() @IsString() note?: string;
}

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  getAlerts(@Request() req) {
    return this.alertsService.getAlerts(req.user.id);
  }

  @Post()
  createAlert(@Request() req, @Body() dto: CreateAlertDto) {
    return this.alertsService.createAlert(req.user.id, req.user.plan, dto);
  }

  @Delete(':id')
  deleteAlert(@Request() req, @Param('id') id: string) {
    return this.alertsService.deleteAlert(req.user.id, id);
  }

  @Put(':id/toggle')
  toggleAlert(@Request() req, @Param('id') id: string) {
    return this.alertsService.toggleAlert(req.user.id, id);
  }
}
