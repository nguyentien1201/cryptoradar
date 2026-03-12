import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { UserEntity } from '../../database/entities/user.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    @InjectRepository(PaymentEntity)
    private paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {
    const stripeKey = config.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });
    }
  }

  // ---- STRIPE ----
  async createStripeCheckout(userId: string, planType: 'monthly' | 'yearly') {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    const prices = {
      monthly: this.config.get('STRIPE_PRICE_MONTHLY'), // $9.99
      yearly: this.config.get('STRIPE_PRICE_YEARLY'),   // $89.99
    };

    const session = await this.stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: prices[planType], quantity: 1 }],
      success_url: `${this.config.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/pricing`,
      metadata: { userId, planType },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, planType } = session.metadata;
      await this.activatePro(userId, 'stripe', session.id, planType);
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const user = await this.userRepo.findOne({ where: { stripeSubscriptionId: sub.id } });
      if (user) await this.userRepo.update(user.id, { plan: 'free', planExpiresAt: null });
    }
  }

  // ---- MOMO ----
  async createMoMoPayment(userId: string, planType: 'monthly' | 'yearly') {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const amount = planType === 'monthly' ? 249000 : 2190000; // VND
    const orderId = `CR_${userId.slice(0, 8)}_${Date.now()}`;

    const partnerCode = this.config.get('MOMO_PARTNER_CODE');
    const accessKey = this.config.get('MOMO_ACCESS_KEY');
    const secretKey = this.config.get('MOMO_SECRET_KEY');
    const redirectUrl = `${this.config.get('FRONTEND_URL')}/payment/success`;
    const ipnUrl = `${this.config.get('API_URL')}/api/v1/payments/momo/webhook`;
    const requestId = orderId;
    const orderInfo = `CryptoRadar VN Pro ${planType === 'monthly' ? 'Tháng' : 'Năm'}`;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=userId:${userId}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithMethod`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const { data } = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', {
      partnerCode, accessKey, requestId, amount, orderId, orderInfo,
      redirectUrl, ipnUrl, requestType: 'payWithMethod',
      extraData: `userId:${userId}`,
      lang: 'vi', signature,
    });

    // Save pending payment
    await this.paymentRepo.save(this.paymentRepo.create({
      userId, provider: 'momo', externalId: orderId,
      amount: amount / 25400, currency: 'VND', status: 'pending',
      planType: `pro_${planType}`,
    }));

    return { payUrl: data.payUrl, orderId };
  }

  async handleMoMoWebhook(body: any) {
    if (body.resultCode === 0) {
      // Success
      const extraData = body.extraData || '';
      const userId = extraData.replace('userId:', '');

      await this.paymentRepo.update({ externalId: body.orderId }, { status: 'completed' });
      await this.activatePro(userId, 'momo', body.orderId, body.orderInfo.includes('Năm') ? 'yearly' : 'monthly');
    }
  }

  private async activatePro(userId: string, provider: string, externalId: string, planType: string) {
    const months = planType === 'yearly' ? 12 : 1;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    await this.userRepo.update(userId, { plan: 'pro', planExpiresAt: expiresAt });
    await this.paymentRepo.save(this.paymentRepo.create({
      userId, provider: provider as any, externalId,
      amount: planType === 'yearly' ? 89.99 : 9.99, currency: 'USD',
      status: 'completed', planType: `pro_${planType}`,
    }));

    this.logger.log(`User ${userId} upgraded to Pro (${planType})`);
  }

  async getPaymentHistory(userId: string) {
    return this.paymentRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
