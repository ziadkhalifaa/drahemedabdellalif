import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = Number(process.env.SMTP_PORT) || 587;
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // Prevent serverless function timeout hanging
    });
  }

  async sendOTP(email: string, code: string) {
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 40px 20px; text-align: center;">
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <img src="https://img.icons8.com/ios-filled/50/ffffff/caduceus.png" alt="Medical Logo" width="40" height="40" style="display: block; margin: 20px auto; filter: brightness(0) invert(1);" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">أ.د. أحمد عبد اللطيف</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">منصة الرعاية الطبية المتكاملة</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 24px;">تأكيد البريد الإلكتروني</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              مرحباً بك،<br>
              لقد تلقينا طلباً للتحقق من بريدك الإلكتروني. يرجى استخدام الرمز التالي لإتمام العملية:
            </p>

            <div style="background: #f1f5f9; border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 2px dashed #cbd5e1;">
              <span style="font-family: monospace; font-size: 42px; font-weight: 900; color: #1e40af; letter-spacing: 12px; display: block; text-align: center; margin-right: -12px;">${code}</span>
            </div>

            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              هذا الرمز صالح لمدة 10 دقائق فقط. إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} عيادات أ.د. أحمد عبد اللطيف. جميع الحقوق محفوظة.<br>
              بني سويف - 6 أكتوبر، مصر
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const from = process.env.SMTP_USER || 'noreply@drahmedabdellatif.com';
      await this.transporter.sendMail({
        from: `"أ.د. أحمد عبد اللطيف" <${from}>`,
        to: email,
        subject: 'رمز التحقق | Verification Code',
        html,
      });
      this.logger.log(`[Email OTP] Sent successfully to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`[Email OTP] Failed to send to ${email}`, error);
      throw error;
    }
  }

  async sendAppointmentStatus(email: string, name: string, date: string, time: string, status: 'approved' | 'rejected', meetingUrl?: string) {
    const isApproved = status === 'approved';
    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const statusText = isApproved ? 'تم تأكيد موعدك بنجاح' : 'نعتذر، تم إلغاء موعدك';
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">تحديث حالة الموعد</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; text-align: center;">
            <div style="width: 64px; height: 64px; background: ${statusColor}20; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
              <span style="color: ${statusColor}; font-size: 32px;">${isApproved ? '✓' : '✕'}</span>
            </div>
            
            <h2 style="color: #0f172a; font-size: 22px; margin-top: 0; margin-bottom: 16px;">${statusText}</h2>
            <p style="color: #64748b; font-size: 16px; margin-bottom: 32px;">مرحباً ${name}،</p>

            <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: right; border: 1px solid #e2e8f0;">
              <div style="margin-bottom: 12px;"><strong>التاريخ:</strong> <span style="color: #475569;">${date}</span></div>
              <div style="margin-bottom: ${meetingUrl ? '12px' : '0'};"><strong>الوقت:</strong> <span style="color: #475569;">${time}</span></div>
              ${meetingUrl ? `<div><strong>رابط الاستشارة:</strong> <a href="${meetingUrl}" style="color: #3b82f6; text-decoration: none;">انقر هنا للإنضمام</a></div>` : ''}
            </div>

            ${isApproved 
              ? `<p style="color: #64748b; font-size: 14px;">يرجى التواجد قبل الموعد بـ 15 دقيقة، أو تجهيز اتصال الإنترنت إذا كانت استشارة أونلاين.</p>` 
              : `<p style="color: #64748b; font-size: 14px;">يرجى التواصل معنا عبر الواتساب لتحديد موعد بديل يناسبك.</p>`}
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const from = process.env.SMTP_USER || 'noreply@drahmedabdellatif.com';
      await this.transporter.sendMail({
        from: `"أ.د. أحمد عبد اللطيف" <${from}>`,
        to: email,
        subject: `حالة موعدك الطبي - ${isApproved ? 'تأكيد' : 'إلغاء'}`,
        html,
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`[Appointment Status Email] Failed to send to ${email}`, error);
      // Don't throw, we don't want to fail the status update if email fails
      return { success: false };
    }
  }

  async sendAppointmentConfirmation(email: string, details: { date: string; time: string; type: string; url?: string }) {
    // Implementation for appointment confirmation emails...
  }
}
