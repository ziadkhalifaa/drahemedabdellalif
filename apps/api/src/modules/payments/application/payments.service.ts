import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { PaymobService } from '../../../common/paymob.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymob: PaymobService,
  ) {}

  async initiatePayment(userId: string, appointmentId: string, amountEGP: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const nameParts = (user.name || 'Patient').split(' ');
    const { iframeUrl, orderId } = await this.paymob.initiatePayment(
      amountEGP * 100, // Convert to cents
      {
        firstName: nameParts[0] || 'Patient',
        lastName: nameParts.slice(1).join(' ') || 'NA',
        email: user.email,
        phone: user.phone || 'NA',
      },
      [{ name: 'Medical Consultation', amount_cents: amountEGP * 100, quantity: 1 }],
    );

    // Store payment record in DB
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        appointmentId,
        amount: amountEGP,
        paymobOrderId: String(orderId),
        status: 'PENDING',
      },
    });

    return { iframeUrl, orderId, paymentId: payment.id };
  }

  async handleCallback(payload: any, hmac: string) {
    const isValid = this.paymob.validateHmac(payload, hmac);
    if (!isValid) {
      this.logger.warn('Invalid HMAC received from Paymob');
      return { status: 'invalid_hmac' };
    }

    const success = payload.success === true || payload.success === 'true';
    const orderId = String(payload.order?.id || payload.order_id);

    if (orderId) {
      const payment = await this.prisma.payment.findUnique({
        where: { paymobOrderId: orderId },
      });

      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: success ? 'SUCCESS' : 'FAILED',
            transactionId: String(payload.id),
            paymentMethod: payload.source_data?.sub_type || 'unknown',
            metadata: payload,
          },
        });

        if (success && payment.appointmentId) {
          await this.prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: 'approved' },
          });
        }
      } else {
        this.logger.warn(`Payment not found for orderId: ${orderId}`);
      }
    }

    return { status: success ? 'success' : 'failed' };
  }

  async getPaymentsByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { appointment: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
