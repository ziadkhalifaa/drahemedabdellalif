/**
 * Seed script: insert the 3 clinics and their working hours
 * Run: npx ts-node apps/api/scripts/seed-clinics.ts
 */
import { PrismaClient } from '@prisma/client';

// Scripts need the direct (non-pooled) connection
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});


async function main() {
  console.log('🌱 Seeding clinics...');

  // ─── Clinic 1: 6th October ────────────────────────────────────────────
  const clinic1 = await prisma.clinic.upsert({
    where: { id: 'clinic-october' },
    update: {},
    create: {
      id: 'clinic-october',
      nameAr: 'عيادة 6 أكتوبر',
      nameEn: '6th October Clinic',
      addressAr: 'أمام حديقة المصري - مبنى بريما فيستا - أعلى بنك CIB',
      addressEn: 'In front of Al-Masry Garden – Prima Vista Building – above CIB Bank',
      phone: '01101211994 / 01010415455',
      isActive: true,
      order: 1,
    },
  });

  // الخميس فقط (4) من 13:00 إلى 15:00 — سلوت كل 30 دقيقة
  await prisma.clinicWorkingHours.upsert({
    where: { clinicId_dayOfWeek: { clinicId: clinic1.id, dayOfWeek: 4 } },
    update: {},
    create: {
      clinicId: clinic1.id,
      dayOfWeek: 4, // Thursday
      startTime: '13:00',
      endTime: '15:00',
      slotDuration: 30,
      isActive: true,
    },
  });

  // ─── Clinic 2: Beni Suef ──────────────────────────────────────────────
  const clinic2 = await prisma.clinic.upsert({
    where: { id: 'clinic-benisuef' },
    update: {},
    create: {
      id: 'clinic-benisuef',
      nameAr: 'عيادة بني سويف',
      nameEn: 'Beni Suef Clinic',
      addressAr: 'برج الندى - ش بورسعيد - بجوار الثانوية بنات - الدور الثاني',
      addressEn: 'Al-Nada Tower – Port Said St – next to Girls Secondary School – 2nd Floor',
      phone: '01024366117 / 082-2135709',
      isActive: true,
      order: 2,
    },
  });

  // السبت → الأربعاء (6,0,1,2,3) من 16:00 إلى 22:00
  const beniSuefDays = [6, 0, 1, 2, 3]; // Sat, Sun, Mon, Tue, Wed
  for (const day of beniSuefDays) {
    await prisma.clinicWorkingHours.upsert({
      where: { clinicId_dayOfWeek: { clinicId: clinic2.id, dayOfWeek: day } },
      update: {},
      create: {
        clinicId: clinic2.id,
        dayOfWeek: day,
        startTime: '16:00',
        endTime: '22:00',
        slotDuration: 30,
        isActive: true,
      },
    });
  }

  // ─── Clinic 3: New Cairo (5th Settlement) ─────────────────────────────
  const clinic3 = await prisma.clinic.upsert({
    where: { id: 'clinic-newcairo' },
    update: {},
    create: {
      id: 'clinic-newcairo',
      nameAr: 'عيادة التجمع الخامس',
      nameEn: 'New Cairo (5th Settlement) Clinic',
      addressAr: 'مبنى HCC - خلف مستشفى الجوي',
      addressEn: 'HCC Building – behind Al-Gawwy Hospital',
      phone: '01101211994 / 01010415455',
      isActive: true,
      order: 3,
    },
  });

  // ─── Online Consultation (Virtual Clinic) ─────────────────────────────
  const clinicOnline = await prisma.clinic.upsert({
    where: { id: 'clinic-online' },
    update: { nameAr: 'استشارات أونلاين', nameEn: 'Online Consultations' },
    create: {
      id: 'clinic-online',
      nameAr: 'استشارات أونلاين',
      nameEn: 'Online Consultations',
      addressAr: 'مكالمة فيديو عبر الإنترنت - مدة 15 دقيقة',
      addressEn: 'Video call via internet - 15 minutes',
      isActive: true,
      order: 0,
    },
  });

  // السبت للخميس (0-4) من 9 ص ل 9 م - سلوت 15 دقيقة
  for (const day of [0, 1, 2, 3, 4]) {
    await prisma.clinicWorkingHours.upsert({
      where: { clinicId_dayOfWeek: { clinicId: clinicOnline.id, dayOfWeek: day } },
      update: {},
      create: {
        clinicId: clinicOnline.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '21:00',
        slotDuration: 15,
        isActive: true,
      },
    });
  }

  // ─── Payment settings in SiteSettings ─────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { key: 'payment.vodafone' },
    update: { value: { number: '01032238095', enabled: true } },
    create: { key: 'payment.vodafone', value: { number: '01032238095', enabled: true } },
  });

  await prisma.siteSettings.upsert({
    where: { key: 'payment.instapay' },
    update: { value: { number: '01032238095@instapay', enabled: true } },
    create: { key: 'payment.instapay', value: { number: '01032238095@instapay', enabled: true } },
  });

  await prisma.siteSettings.upsert({
    where: { key: 'payment.price' },
    update: { value: { amount: 400, currency: 'EGP' } },
    create: { key: 'payment.price', value: { amount: 400, currency: 'EGP' } },
  });

  await prisma.siteSettings.upsert({
    where: { key: 'consultation.online_duration' },
    update: { value: { minutes: 15 } },
    create: { key: 'consultation.online_duration', value: { minutes: 15 } },
  });

  console.log('✅ Clinics seeded successfully!');
  console.log(`  - ${clinic1.nameAr} (${clinic1.id})`);
  console.log(`  - ${clinic2.nameAr} (${clinic2.id})`);
  console.log(`  - ${clinic3.nameAr} (${clinic3.id})`);
  console.log(`  - ${clinicOnline.nameAr} (${clinicOnline.id})`);
  console.log('  - Payment settings saved');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
