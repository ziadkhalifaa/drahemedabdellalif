import { Controller, Post, Body, Get, Req, UseGuards, Query, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './application/payments.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  /**
   * Initiate a payment for an appointment
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('initiate')
  async initiatePayment(
    @Req() req: any,
    @Body() body: { appointmentId: string; amount: number },
  ) {
    return this.paymentsService.initiatePayment(
      req.user.id,
      body.appointmentId,
      body.amount,
    );
  }

  /**
   * Paymob webhook callback
   * Protected by HMAC validation and secret header
   */
  @SkipThrottle()
  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Query('hmac') hmac: string,
    @Headers('x-paymob-signature') paymobSignature: string,
  ) {
    const webhookSecret = process.env.PAYMOB_WEBHOOK_SECRET;

    if (webhookSecret && paymobSignature !== webhookSecret) {
      this.logger.warn(`Invalid webhook secret from IP: unknown`);
      throw new UnauthorizedException('Invalid webhook credentials');
    }

    if (!hmac && !paymobSignature) {
      throw new UnauthorizedException('Missing authentication');
    }

    return this.paymentsService.handleCallback(body.obj, hmac);
  }
}
