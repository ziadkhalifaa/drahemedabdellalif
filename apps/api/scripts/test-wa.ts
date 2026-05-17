import { config } from 'dotenv';
import axios from 'axios';
import { resolve } from 'path';

// Load env vars
config({ path: resolve(__dirname, '../.env') });

async function testWhatsApp() {
  console.log('Testing WhatsApp Integration...');
  const instanceId = process.env.ULTRAMSG_INSTANCE;
  const token = process.env.ULTRAMSG_TOKEN;
  
  if (!instanceId || !token) {
    console.error('Error: ULTRAMSG_INSTANCE or ULTRAMSG_TOKEN is not set in .env');
    process.exit(1);
  }

  console.log(`Using Instance: ${instanceId}`);
  
  const phone = '+201124860234'; // From the screenshot
  const message = '✅ مرحباً! هذه رسالة تجريبية من منصة د. أحمد عبد اللطيف للتأكد من تفعيل إشعارات الواتساب بنجاح.';

  try {
    console.log(`Sending message to ${phone}...`);
    const response = await axios.post(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      token,
      to: phone,
      body: message,
    });
    console.log('Success! Response:', response.data);
  } catch (error: any) {
    console.error('Failed to send message:', error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

testWhatsApp();
