import { Controller, Post, Body, Get, Req, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './application/payments.service';

@Controller('payments')
export class PaymentsController {
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
   */
  @Post('webhook')
  async handleWebhook(@Body() body: any, @Query('hmac') hmac: string) {
    return this.paymentsService.handleCallback(body.obj, hmac);
  }
}
