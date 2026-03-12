import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Telegraf } from 'telegraf';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;
  private bot: Telegraf;

  constructor(private config: ConfigService) {
    // Email setup
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: parseInt(config.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });

    // Telegram Bot
    const token = config.get('TELEGRAM_BOT_TOKEN');
    if (token) {
      this.bot = new Telegraf(token);
      this.setupTelegramCommands();
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      await this.transporter.sendMail({
        from: `"CryptoRadar VN" <${this.config.get('SMTP_FROM') || 'noreply@cryptoradar.vn'}>`,
        to,
        subject,
        html: this.wrapEmailTemplate(subject, htmlContent),
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Email failed to ${to}:`, err.message);
    }
  }

  async sendTelegram(chatId: string, message: string) {
    if (!this.bot) return;
    try {
      await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
      this.logger.log(`Telegram sent to ${chatId}`);
    } catch (err) {
      this.logger.error(`Telegram failed to ${chatId}:`, err.message);
    }
  }

  private setupTelegramCommands() {
    this.bot.start((ctx) => {
      ctx.reply(
        `🚀 Chào mừng đến với <b>CryptoRadar VN Bot</b>!\n\n` +
        `Chat ID của bạn: <code>${ctx.chat.id}</code>\n\n` +
        `Hãy copy Chat ID trên và dán vào cài đặt tài khoản tại cryptoradar.vn để nhận thông báo.`,
        { parse_mode: 'HTML' }
      );
    });

    this.bot.help((ctx) => {
      ctx.reply('Lệnh:\n/start - Lấy Chat ID\n/status - Trạng thái kết nối');
    });

    this.bot.launch().catch(console.error);
  }

  private wrapEmailTemplate(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><style>
        body { font-family: -apple-system, sans-serif; background: #0a0f1e; color: #e0e6ff; margin: 0; padding: 20px; }
        .card { background: #0d1526; border: 1px solid rgba(100,181,246,0.2); border-radius: 12px; padding: 24px; max-width: 500px; margin: 0 auto; }
        h2 { color: #64b5f6; margin-top: 0; }
        .price { font-size: 24px; font-weight: bold; color: #00e676; font-family: monospace; }
        .footer { color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 20px; text-align: center; }
        a { color: #64b5f6; }
      </style></head>
      <body>
        <div class="card">
          <h2>🚀 CryptoRadar VN</h2>
          <div>${content.replace(/\n/g, '<br>')}</div>
          <div class="footer">
            <a href="https://cryptoradar.vn">cryptoradar.vn</a> · 
            <a href="https://cryptoradar.vn/settings/alerts">Quản lý cảnh báo</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
