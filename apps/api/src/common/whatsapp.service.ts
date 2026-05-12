import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  async sendMessage(phone: string, message: string) {
    const instanceId = process.env.ULTRAMSG_INSTANCE;
    const token = process.env.ULTRAMSG_TOKEN;
    
    if (!instanceId || !token) {
      this.logger.warn('WhatsApp not configured, skipping...');
      return;
    }

    try {
      await axios.post(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        token,
        to: phone.startsWith('+') ? phone : `+2${phone}`,
        body: message,
      });
    } catch (error: any) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  async sendOTP(phone: string, code: string) {
    const message = `رمز التحقق الخاص بك لمنصة د. أحمد عبد اللطيف هو: ${code}\nيرجى عدم مشاركة هذا الرمز مع أي شخص.`;
    return this.sendMessage(phone, message);
  }

  async sendAppointmentConfirmation(phone: string, details: { date: string; time: string; type: string; url?: string }) {
    const typeText = details.type === 'ONLINE' ? 'استشارة أونلاين' : 'موعد في العيادة';
    let message = `تم تأكيد موعدك مع د. أحمد عبد اللطيف:\nالتاريخ: ${details.date}\nالوقت: ${details.time}\nالنوع: ${typeText}`;
    
    if (details.url) {
      message += `\nرابط الاستشارة: ${details.url}`;
    }

    return this.sendMessage(phone, message);
  }

  async sendReminder(phone: string, name: string, date: string, time: string) {
    const message = `تذكير بموعدك غداً د. ${name}:\nالتاريخ: ${date}\nالوقت: ${time}`;
    return this.sendMessage(phone, message);
  }
}
