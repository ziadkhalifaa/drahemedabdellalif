'use client';

import { useLocale } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col selection:bg-[var(--primary)] selection:text-white">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-24 md:py-32">
        <div className="mb-10 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mb-2">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--primary-dark)] dark:text-white">
            {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isAr ? 'آخر تحديث: يونيو 2026' : 'Last updated: June 2026'}
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-8 leading-relaxed">
          {isAr ? (
            <>
              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">1. مقدمة</h2>
                <p>
                  نحن في عيادات د. أحمد عبد اللطيف نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية والطبية. توضح سياسة الخصوصية هذه كيفية جمعنا لبياناتك واستخدامها وحمايتها عند استخدامك لموقعنا الإلكتروني وخدمات حجز الاستشارات الأونلاين.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">2. المعلومات التي نجمعها</h2>
                <p>نقوم بجمع المعلومات التالية بغرض تقديم أفضل رعاية طبية ممكنة:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li><strong>المعلومات الشخصية:</strong> الاسم، العمر، النوع، وتاريخ الميلاد.</li>
                  <li><strong>معلومات الاتصال:</strong> رقم الهاتف (واتساب) والبريد الإلكتروني.</li>
                  <li><strong>المعلومات الطبية:</strong> التاريخ المرضي، التقارير والروشتات المرفوعة، والأدوية الحالية.</li>
                  <li><strong>معلومات الدفع:</strong> إيصالات التحويل البنكي أو فودافون كاش لتأكيد الحجوزات (لا نحتفظ بأي أرقام بطاقات ائتمانية).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">3. كيف نستخدم معلوماتك</h2>
                <p>تُستخدم المعلومات التي نجمعها للأغراض التالية فقط:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>جدولة وإدارة مواعيد الاستشارات الأونلاين.</li>
                  <li>تقديم الاستشارة الطبية الدقيقة بناءً على تاريخك المرضي.</li>
                  <li>التواصل معك لتأكيد المواعيد أو المتابعة الطبية وإرسال التذكيرات.</li>
                  <li>تحسين مستوى الخدمة الطبية وتجربة المستخدم على الموقع.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">4. حماية البيانات ومشاركتها</h2>
                <p>
                  نحن نطبق أعلى معايير الأمان الرقمي لحماية بياناتك. <strong>لا نقوم أبداً ببيع، أو تأجير، أو مشاركة معلوماتك الشخصية أو الطبية مع أي أطراف خارجية</strong> باستثناء ما يقتضيه القانون أو لحماية حياة المريض. يتم حفظ التقارير الطبية في خوادم سحابية مشفرة ولا يمكن الوصول إليها إلا للمختصين الطبيين.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">5. منصة الاستشارات (مكالمات الفيديو)</h2>
                <p>
                  نحن نستخدم مزودي خدمة فيديو معتمدين وآمنين (مثل Daily.co أو Jitsi) لتقديم الاستشارات الأونلاين. المحادثات مشفرة بالكامل ولا يتم تسجيل أو حفظ أي مكالمات فيديو حفاظاً على سرية المريض المطلقة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">6. حقوق المريض</h2>
                <p>يحق لك في أي وقت:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>طلب نسخة من ملفك الطبي المحفوظ لدينا.</li>
                  <li>تحديث أو تصحيح بياناتك الشخصية.</li>
                  <li>طلب حذف حسابك وبياناتك من نظام الحجز الخاص بنا.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">7. تواصل معنا</h2>
                <p>
                  إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر الأرقام الموضحة في الموقع أو إرسال بريد إلكتروني إلى info@drahmedabdellatif.com.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">1. Introduction</h2>
                <p>
                  At Dr. Ahmed Abdellatif Clinics, we respect your privacy and are committed to protecting your personal and medical data. This Privacy Policy explains how we collect, use, and safeguard your information when using our website and online consultation booking services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">2. Information We Collect</h2>
                <p>We collect the following information to provide the best possible medical care:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li><strong>Personal Information:</strong> Name, age, gender, and date of birth.</li>
                  <li><strong>Contact Information:</strong> Phone number (WhatsApp) and email address.</li>
                  <li><strong>Medical Information:</strong> Medical history, uploaded reports, and current medications.</li>
                  <li><strong>Payment Information:</strong> Transfer receipts to confirm bookings (we do not store credit card numbers).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">3. How We Use Your Information</h2>
                <p>The information we collect is used strictly for the following purposes:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>Scheduling and managing online consultations.</li>
                  <li>Providing accurate medical advice based on your medical history.</li>
                  <li>Communicating with you to confirm appointments, provide medical follow-ups, and send reminders.</li>
                  <li>Improving the medical service and user experience on our platform.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">4. Data Protection and Sharing</h2>
                <p>
                  We implement high digital security standards to protect your data. <strong>We never sell, rent, or share your personal or medical information with external third parties</strong> except as required by law or to protect a patient's life. Medical reports are stored in encrypted cloud servers accessible only by authorized medical personnel.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">5. Consultation Platform (Video Calls)</h2>
                <p>
                  We use verified and secure video service providers (like Daily.co or Jitsi) to conduct online consultations. Conversations are end-to-end encrypted, and no video calls are recorded or stored to maintain absolute patient confidentiality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">6. Patient Rights</h2>
                <p>You have the right at any time to:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>Request a copy of your medical file stored with us.</li>
                  <li>Update or correct your personal data.</li>
                  <li>Request the deletion of your account and data from our booking system.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">7. Contact Us</h2>
                <p>
                  If you have any questions or concerns about this Privacy Policy, please contact us via the numbers provided on the website or send an email to info@drahmedabdellatif.com.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
