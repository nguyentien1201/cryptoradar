import { Controller, Post, Get, Body, Headers, RawBodyRequest, Req, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('stripe/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createStripeCheckout(@Request() req, @Body() body: { planType: 'monthly' | 'yearly' }) {
    return this.paymentsService.createStripeCheckout(req.user.id, body.planType);
  }

  @Post('stripe/webhook')
  stripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    return this.paymentsService.handleStripeWebhook(req.rawBody, sig);
  }

  @Post('momo/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createMoMoPayment(@Request() req, @Body() body: { planType: 'monthly' | 'yearly' }) {
    return this.paymentsService.createMoMoPayment(req.user.id, body.planType);
  }

  @Post('momo/webhook')
  momoWebhook(@Body() body: any) {
    return this.paymentsService.handleMoMoWebhook(body);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getHistory(@Request() req) {
    return this.paymentsService.getPaymentHistory(req.user.id);
  }
}
