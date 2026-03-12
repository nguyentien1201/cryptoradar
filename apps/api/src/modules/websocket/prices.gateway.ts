import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PricesService } from '../prices/prices.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class PricesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(PricesGateway.name);

  constructor(private pricesService: PricesService) {}

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_prices')
  handleSubscribePrices(@MessageBody() data: { coins: string[] }, @ConnectedSocket() client: Socket) {
    const room = `prices:${data.coins.sort().join(',')}`;
    client.join(room);
    return { event: 'subscribed', data: { room } };
  }

  @SubscribeMessage('subscribe_portfolio')
  handleSubscribePortfolio(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    client.join(`portfolio:${data.userId}`);
    return { event: 'subscribed' };
  }

  // Broadcast price updates every 30s
  @Interval(30000)
  async broadcastPrices() {
    try {
      const data = await this.pricesService.getMarketData(1, 30);
      this.server.emit('price_update', {
        timestamp: Date.now(),
        prices: data.reduce((acc: any, coin: any) => {
          acc[coin.id] = {
            usd: coin.current_price,
            change24h: coin.price_change_percentage_24h,
            volume: coin.total_volume,
          };
          return acc;
        }, {}),
      });
    } catch (err) {
      this.logger.error('Broadcast failed:', err.message);
    }
  }

  // Emit alert triggered to specific user
  emitAlertTriggered(userId: string, alert: any) {
    this.server.to(`portfolio:${userId}`).emit('alert_triggered', alert);
  }
}
