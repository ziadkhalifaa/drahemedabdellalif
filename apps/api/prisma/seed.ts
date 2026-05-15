import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing services to avoid duplicates during re-seeding
  await prisma.service.deleteMany({});

  const adminPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@drahmedabdellatif.com' },
    update: {
      name: 'Prof. Dr. Ahmed Abdellatif',
    },
    create: {
      email: 'admin@drahmedabdellatif.com',
      password: adminPassword,
      name: 'Prof. Dr. Ahmed Abdellatif',
      role: 'admin',
    },
  });

  const services = [
    {
      titleAr: 'علاج تضخم البروستاتا',
      titleEn: 'Prostate Enlargement Treatment',
      descriptionAr: 'علاج تضخم البروستاتا الحميد باستخدام أحدث التقنيات الجراحية وغير الجراحية.',
      descriptionEn: 'Treatment of Benign Prostatic Hyperplasia (BPH) using the latest surgical and non-surgical techniques.',
      icon: 'Shield',
      image: 'https://images.unsplash.com/photo-1579154235602-3c35bd79951e?q=80&w=800&auto=format&fit=crop',
      order: 1,
    },
    {
      titleAr: 'المنظار المرن وتفتيت الحصوات',
      titleEn: 'Flexible Endoscopy & Stone Fragmentation',
      descriptionAr: 'استخدام المناظير المرنة لتفتيت حصوات الكلى والحالب بدون جراحة.',
      descriptionEn: 'Using flexible endoscopes to fragment kidney and ureteral stones without traditional surgery.',
      icon: 'Scan',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
      order: 2,
    },
    {
      titleAr: 'تفتيت حصوات الجهاز البولي بالليزر',
      titleEn: 'Laser Stone Fragmentation (HoLEP)',
      descriptionAr: 'تفتيت حصوات الكلى، الحالب والمثانة باستخدام تقنية الهولميوم ليزر المتقدمة.',
      descriptionEn: 'Fragmentation of kidney, ureter, and bladder stones using advanced Holmium laser technology.',
      icon: 'Activity',
      image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=800&auto=format&fit=crop',
      order: 3,
    },
    {
      titleAr: 'سرطان البروستاتا وطرق العلاج',
      titleEn: 'Prostate Cancer Diagnosis & Treatment',
      descriptionAr: 'تشخيص وعلاج أورام وسرطان البروستاتا باستخدام أحدث البروتوكولات العالمية.',
      descriptionEn: 'Diagnosis and treatment of prostate tumors and cancer using the latest international protocols.',
      icon: 'Gem',
      image: 'https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=800&auto=format&fit=crop',
      order: 4,
    },
    {
      titleAr: 'أمراض الذكورة والضعف الجنسي',
      titleEn: 'Andrology & Erectile Dysfunction',
      descriptionAr: 'علاج مشاكل الضعف الجنسي، تأخر الإنجاب، ودوالي الخصية عند الرجال.',
      descriptionEn: 'Treatment of erectile dysfunction, male infertility, and varicocele in men.',
      icon: 'Heart',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
      order: 5,
    },
    {
      titleAr: 'علاج سرطان المثانة',
      titleEn: 'Bladder Cancer Treatment',
      descriptionAr: 'استئصال أورام المثانة ومتابعتها لضمان الشفاء التام ومنع الارتجاع.',
      descriptionEn: 'Surgical resection and follow-up of bladder tumors to ensure full recovery and prevent recurrence.',
      icon: 'Shield',
      image: 'https://images.unsplash.com/photo-1586773860418-d3b9a8ec81a2?q=80&w=800&auto=format&fit=crop',
      order: 6,
    },
    {
      titleAr: 'تبخير البروستاتا بالبلازما',
      titleEn: 'Plasma Prostate Vaporization',
      descriptionAr: 'تقنية تبخير البروستاتا الحديثة التي تضمن سرعة التعافي وتقليل النزيف.',
      descriptionEn: 'Modern prostate vaporization technology ensuring fast recovery and minimal bleeding.',
      icon: 'Stethoscope',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop',
      order: 7,
    },
    {
      titleAr: 'استئصال البروستاتا بالمنظار',
      titleEn: 'Laparoscopic Prostatectomy',
      descriptionAr: 'إجراء عمليات البروستاتا المعقدة عن طريق فتحات صغيرة جداً باستخدام المنظار.',
      descriptionEn: 'Performing complex prostate surgeries through tiny incisions using laparoscopic techniques.',
      icon: 'Scan',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop',
      order: 8,
    },
    {
      titleAr: 'تقنية الريزوم (بخار الماء)',
      titleEn: 'Rezum Water Vapor Therapy',
      descriptionAr: 'أحدث علاج غير جراحي لتضخم البروستاتا باستخدام بخار الماء في دقائق معدودة.',
      descriptionEn: 'The latest non-surgical treatment for prostate enlargement using water vapor in just minutes.',
      icon: 'Activity',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=800&auto=format&fit=crop',
      order: 9,
    },
    {
      titleAr: 'تقنية الايكو ليزر',
      titleEn: 'EchoLaser Treatment',
      descriptionAr: 'استخدام الموجات فوق الصوتية والليزر لعلاج تضخم البروستاتا بدون تخدير كلي.',
      descriptionEn: 'Using ultrasound and laser for treating prostate enlargement without general anesthesia.',
      icon: 'Scan',
      image: 'https://images.unsplash.com/photo-1583324113626-70df0f43aaad?q=80&w=800&auto=format&fit=crop',
      order: 10,
    },
    {
      titleAr: 'جراحة مسالك الأطفال',
      titleEn: 'Pediatric Urology',
      descriptionAr: 'علاج العيوب الخلقية والمشاكل التناسلية عند الأطفال بأعلى درجات الدقة.',
      descriptionEn: 'Treating congenital defects and reproductive issues in children with maximum precision.',
      icon: 'Stethoscope',
      image: 'https://images.unsplash.com/photo-1584362946045-121f8ad92139?q=80&w=800&auto=format&fit=crop',
      order: 11,
    }
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }

  // Seed working hours
  const workingHours = [
    { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: true },
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '14:00', slotDuration: 30, isActive: false },
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', slotDuration: 30, isActive: false },
  ];

  for (const wh of workingHours) {
    await (prisma as any).workingHours.upsert({
      where: { id: `wh-${wh.dayOfWeek}` }, // Note: id will be auto-generated but we use upsert logic
      update: wh,
      create: { ...wh, id: `wh-${wh.dayOfWeek}` },
    }).catch(() => {}); // Simple catch for seed
  }

  // Seed site settings
  await (prisma as any).siteSettings.upsert({
    where: { key: 'default' },
    update: {},
    create: {
      key: 'default',
      value: {
        siteNameAr: 'د. أحمد عبد اللطيف',
        siteNameEn: 'Dr. Ahmed Abdellatif',
        contactEmail: 'info@drahmedabdellatif.com',
        contactPhone: '+201234567890',
        addressAr: 'القاهرة، مصر',
        addressEn: 'Cairo, Egypt',
      }
    }
  });

  await (prisma as any).siteSettings.upsert({
    where: { key: 'about.image' },
    update: {
      value: { src: '/images/dr-ahmed.png', alt: 'Prof. Dr. Ahmed' }
    },
    create: {
      key: 'about.image',
      value: { src: '/images/dr-ahmed.png', alt: 'Prof. Dr. Ahmed' }
    }
  });

  // Seed Hero Slides
  await (prisma as any).heroSlide.deleteMany({});
  await (prisma as any).heroSlide.createMany({
    data: [
      {
        titleAr: 'أ.د. أحمد عبد اللطيف',
        titleEn: 'Prof. Dr. Ahmed Abdellatif',
        subtitleAr: 'أستاذ واستشاري جراحة المسالك البولية والكلى والمناظير والذكورة',
        subtitleEn: 'Professor & Consultant of Urology, Endoscopy, and Andrology',
        image: '/images/dr-ahmed.png',
        isPortrait: true,
        order: 1,
      }
    ]
  });

  // Seed Techniques
  await (prisma as any).technique.deleteMany({});
  await (prisma as any).technique.createMany({
    data: [
      {
        titleAr: 'تبخير البروستاتا بالبلازما',
        titleEn: 'Plasma Prostate Vaporization',
        descriptionAr: 'تقنية آمنة لعلاج تضخم البروستاتا الحميد بدون جراحة تقليدية.',
        descriptionEn: 'Safe technology for treating BPH without traditional surgery.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
        slug: 'plasma-vaporization',
        order: 1,
      },
      {
        titleAr: 'ليزر هولميوم (HoLEP)',
        titleEn: 'Holmium Laser (HoLEP)',
        descriptionAr: 'استئصال البروستاتا بالليزر، الخيار الذهبي للأحجام الكبيرة.',
        descriptionEn: 'Laser enucleation of the prostate, the gold standard for large prostates.',
        image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=800&auto=format&fit=crop',
        slug: 'holep',
        order: 2,
      },
      {
        titleAr: 'المناظير المرنة',
        titleEn: 'Flexible Endoscopy',
        descriptionAr: 'تفتيت حصوات الكلى والحالب بالليزر عبر المنظار المرن بدون جروح.',
        descriptionEn: 'Laser fragmentation of kidney and ureteral stones via flexible endoscope.',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=800&auto=format&fit=crop',
        slug: 'flexible-endoscopy',
        order: 3,
      }
    ]
  });

  console.log('Seed completed');
}

main()
  .then(() => {
    console.log('Seed completed');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
