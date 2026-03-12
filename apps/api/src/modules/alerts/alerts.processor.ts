// alerts.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { UserEntity } from '../../database/entities/user.entity';

@Processor('alerts')
export class AlertsProcessor {
  private readonly logger = new Logger(AlertsProcessor.name);

  constructor(
    private notificationsService: NotificationsService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  @Process('send-alert')
  async handleAlert(job: Job) {
    const { alert, currentPrice, change24h } = job.data;

    const user = await this.userRepo.findOne({
      where: { id: alert.userId },
      select: ['id', 'email', 'name', 'telegramChatId'],
    });

    if (!user) return;

    const message = this.buildMessage(alert, currentPrice, change24h);

    const promises = [];

    if (alert.channels.includes('email')) {
      promises.push(
        this.notificationsService.sendEmail(user.email, `🚨 Cảnh báo giá ${alert.coinSymbol}`, message)
      );
    }

    if (alert.channels.includes('telegram') && user.telegramChatId) {
      promises.push(
        this.notificationsService.sendTelegram(user.telegramChatId, message)
      );
    }

    await Promise.allSettled(promises);
    this.logger.log(`Notifications sent for alert ${alert.id}`);
  }

  private buildMessage(alert: any, currentPrice: number, change24h: number) {
    const emoji = alert.condition === 'above' ? '📈' : '📉';
    return `${emoji} <b>CryptoRadar VN - Cảnh báo giá</b>\n\n` +
      `Coin: <b>${alert.coinSymbol}</b>\n` +
      `Điều kiện: ${alert.condition === 'above' ? 'Vượt trên' : 'Xuống dưới'} $${Number(alert.targetPrice).toLocaleString()}\n` +
      `Giá hiện tại: <b>$${currentPrice.toLocaleString()}</b>\n` +
      `Thay đổi 24h: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%\n` +
      (alert.note ? `Ghi chú: ${alert.note}\n` : '') +
      `\n⏰ ${new Date().toLocaleString('vi-VN')}`;
  }
}
