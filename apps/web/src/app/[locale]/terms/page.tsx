'use client';

import { useLocale } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col selection:bg-[var(--primary)] selection:text-white">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-24 md:py-32">
        <div className="mb-10 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mb-2">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--primary-dark)] dark:text-white">
            {isAr ? 'شروط الخدمة والاستخدام' : 'Terms of Service'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isAr ? 'آخر تحديث: يونيو 2026' : 'Last updated: June 2026'}
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-8 leading-relaxed">
          {isAr ? (
            <>
              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">1. الموافقة على الشروط</h2>
                <p>
                  بدخولك واستخدامك لمنصة عيادات د. أحمد عبد اللطيف، فإنك توافق على الالتزام بشروط الخدمة التالية. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام خدمات الحجز الأونلاين.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">2. طبيعة الخدمة (الاستشارات الأونلاين)</h2>
                <p>
                  تقدم المنصة خدمة الاستشارات الطبية عن بُعد (عبر مكالمات الفيديو). هذه الخدمة مخصصة للحالات غير الطارئة التي لا تتطلب كشفاً بدنياً فورياً. الاستشارة الأونلاين لا تُغني بالضرورة عن الفحص الإكلينيكي في حال تطلب الأمر ذلك.
                </p>
                <p className="mt-2 text-orange-600 font-medium">
                  ملاحظة هامة: في حالات الطوارئ الطبية القصوى، يجب التوجه إلى أقرب قسم طوارئ أو مستشفى على الفور وعدم الاعتماد على الاستشارة الأونلاين.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">3. الحجز والدفع</h2>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>يتم الحجز عن طريق اختيار التاريخ والوقت المناسبين المتاحين في الجدول الزمني للدكتور.</li>
                  <li>لتأكيد الحجز، يجب تحويل قيمة الاستشارة كاملة مسبقاً عبر فودافون كاش أو انستا باي، ورفع صورة الإيصال.</li>
                  <li>الحجوزات التي لم يُرفع لها إيصال التحويل تعتبر قيد المراجعة ولا تُعتمد إلا بعد التأكيد من قِبل إدارة العيادة.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">4. سياسة الإلغاء وتغيير الموعد</h2>
                <p>نحرص على تنظيم المواعيد لخدمة جميع المرضى، لذا يُرجى الالتزام بالآتي:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li><strong>الإلغاء:</strong> يمكن للمريض إلغاء أو تعديل موعد الاستشارة مجاناً إذا تم ذلك قبل الموعد بـ 24 ساعة على الأقل. يتم استرداد المبلغ كاملاً في هذه الحالة.</li>
                  <li><strong>التخلف عن الموعد:</strong> في حال عدم حضور المريض للاستشارة الأونلاين في الوقت المحدد دون إخطار مسبق بـ 24 ساعة، لا يحق للمريض استرداد قيمة الاستشارة.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">5. دقة المعلومات الطبية</h2>
                <p>
                  يتحمل المريض مسؤولية صحة ودقة جميع البيانات الشخصية والتاريخ الطبي والتقارير المرفوعة عبر النظام. د. أحمد غير مسؤول عن أي تشخيص غير دقيق ناتج عن حجب أو تقديم معلومات طبية خاطئة من قِبل المريض.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">6. إخلاء المسؤولية التقنية</h2>
                <p>
                  نسعى لضمان توفر المنصة وخدمات الفيديو بأعلى جودة. ومع ذلك، لا نتحمل المسؤولية عن أي تأخير أو انقطاع في الاستشارة بسبب مشاكل اتصال الإنترنت من جانب المريض، وفي حال حدوث خلل تقني يتم التنسيق لموعد بديل.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">7. التعديلات على الشروط</h2>
                <p>
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التغييرات على هذه الصفحة، ويعتبر استمرارك في استخدام الموقع بعد التعديلات بمثابة موافقة منك على الشروط الجديدة.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Dr. Ahmed Abdellatif's platform, you agree to comply with the following Terms of Service. If you do not agree with any of these terms, please do not use the online booking services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">2. Nature of Service (Online Consultations)</h2>
                <p>
                  The platform provides remote medical consultations (via video calls). This service is intended for non-emergency cases that do not require immediate physical examination. An online consultation does not necessarily replace clinical examination if deemed necessary.
                </p>
                <p className="mt-2 text-orange-600 font-medium">
                  Important Note: In severe medical emergencies, you must proceed to the nearest emergency department or hospital immediately and not rely on online consultations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">3. Booking and Payment</h2>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Bookings are made by selecting an available date and time from the doctor's schedule.</li>
                  <li>To confirm the booking, the full consultation fee must be transferred in advance via Vodafone Cash or InstaPay, and a copy of the receipt must be uploaded.</li>
                  <li>Bookings without an uploaded transfer receipt are considered pending and are not confirmed until verified by the clinic administration.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">4. Cancellation and Rescheduling Policy</h2>
                <p>We strive to organize appointments to serve all patients, so please adhere to the following:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li><strong>Cancellation:</strong> Patients can cancel or reschedule the consultation free of charge if done at least 24 hours prior to the appointment. A full refund is provided in this case.</li>
                  <li><strong>No-show:</strong> If the patient fails to attend the online consultation at the scheduled time without 24 hours prior notice, they are not entitled to a refund of the consultation fee.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">5. Accuracy of Medical Information</h2>
                <p>
                  The patient is responsible for the accuracy and correctness of all personal data, medical history, and reports uploaded through the system. Dr. Ahmed is not liable for any inaccurate diagnosis resulting from withholding or providing incorrect medical information by the patient.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">6. Technical Disclaimer</h2>
                <p>
                  We strive to ensure the availability of the platform and video services at the highest quality. However, we are not responsible for any delay or interruption in the consultation due to internet connection issues on the patient's side. In the event of a technical malfunction, an alternative appointment will be coordinated.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">7. Amendments to Terms</h2>
                <p>
                  We reserve the right to amend these terms at any time. Changes will be posted on this page, and your continued use of the site following the modifications constitutes your acceptance of the new terms.
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
