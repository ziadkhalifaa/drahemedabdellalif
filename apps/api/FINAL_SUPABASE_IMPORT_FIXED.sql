-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'editor', 'patient');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('ONLINE', 'IN_CLINIC');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerificationCode" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationCode" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'patient',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "type" "AppointmentType" NOT NULL DEFAULT 'IN_CLINIC',
    "patientId" TEXT,
    "guestName" TEXT,
    "guestPhone" TEXT,
    "guestEmail" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "meetingId" TEXT,
    "meetingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalReport" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "slugAr" TEXT NOT NULL,
    "slugEn" TEXT NOT NULL,
    "contentAr" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "excerptAr" TEXT,
    "excerptEn" TEXT,
    "metaTitleAr" TEXT,
    "metaTitleEn" TEXT,
    "metaDescriptionAr" TEXT,
    "metaDescriptionEn" TEXT,
    "keywords" TEXT,
    "categoryId" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'draft',
    "featuredImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slugAr" TEXT NOT NULL,
    "slugEn" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slugAr" TEXT NOT NULL,
    "slugEn" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "blogId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("blogId","tagId")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientAvatar" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleEn" TEXT,
    "categoryAr" TEXT,
    "categoryEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_meetingId_key" ON "Appointment"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slugAr_key" ON "BlogPost"("slugAr");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slugEn_key" ON "BlogPost"("slugEn");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slugAr_key" ON "Category"("slugAr");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slugEn_key" ON "Category"("slugEn");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slugAr_key" ON "Tag"("slugAr");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slugEn_key" ON "Tag"("slugEn");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalReport" ADD CONSTRAINT "MedicalReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;


SET session_replication_role = 'replica';

-- Data for table User
INSERT INTO "User" ("id", "email", "password", "name", "phone", "isPhoneVerified", "phoneVerificationCode", "isEmailVerified", "emailVerificationCode", "role", "createdAt", "updatedAt") VALUES ('cmox3agex0000vff0nivj82zz', 'admin@drahmed.com', '$2b$12$8pm7BRiGPhzmOUfQ/IFdxOCn2QUAjMFZD/Z8JgHt5nZrBzHHKU5by', 'Prof. Dr. Ahmed Abdellatif', NULL, FALSE, NULL, FALSE, NULL, 'admin', '2026-05-08T15:48:16.664Z', '2026-05-08T18:11:32.051Z');
INSERT INTO "User" ("id", "email", "password", "name", "phone", "isPhoneVerified", "phoneVerificationCode", "isEmailVerified", "emailVerificationCode", "role", "createdAt", "updatedAt") VALUES ('cmp0ecm4g0004vfek9bel4i9r', 'carolinaalecar00@gmail.com', '$2b$10$fUvQ5GMrRIuVExWUSZFLY.bagVNkoeAJQ14nd8VoVoC30eIbAvQlu', 'زياد2', '01032238095', FALSE, NULL, FALSE, '996218', 'patient', '2026-05-10T23:21:11.680Z', '2026-05-10T23:21:11.680Z');
INSERT INTO "User" ("id", "email", "password", "name", "phone", "isPhoneVerified", "phoneVerificationCode", "isEmailVerified", "emailVerificationCode", "role", "createdAt", "updatedAt") VALUES ('cmp0eacbg0002vfekoe053z1k', 'zezo.hero96@gmail.com', '$2b$10$47BLPqJpCxu76w9rivcAk.Onk/7ma66Z.ekoDWx//1gM11rtyzZPG', 'ziad', '01032238095', FALSE, NULL, TRUE, NULL, 'patient', '2026-05-10T23:19:25.660Z', '2026-05-10T23:32:14.197Z');

-- Data for table Service
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eoo90001vfysdsicuee5', 'علاج تضخم البروستاتا', 'Prostate Enlargement Treatment', 'علاج تضخم البروستاتا الحميد باستخدام أحدث التقنيات الجراحية وغير الجراحية.', 'Treatment of Benign Prostatic Hyperplasia (BPH) using the latest surgical and non-surgical techniques.', 'Shield', '/uploads/60834e7c-6389-4629-a6d8-6c0e03aa2e22.webp', 1, TRUE, '2026-05-08T18:11:32.073Z', '2026-05-08T21:39:42.774Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eooh0007vfysj70wvfnt', 'تبخير البروستاتا بالبلازما', 'Plasma Prostate Vaporization', 'تقنية تبخير البروستاتا الحديثة التي تضمن سرعة التعافي وتقليل النزيف.', 'Modern prostate vaporization technology ensuring fast recovery and minimal bleeding.', 'Stethoscope', '/uploads/dcf93cdc-6249-4c83-bc5a-3a34a74c28da.webp', 7, TRUE, '2026-05-08T18:11:32.081Z', '2026-05-08T22:04:01.203Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eoof0005vfyssp9b34r2', 'أمراض الذكورة والضعف الجنسي', 'Andrology & Erectile Dysfunction', 'علاج مشاكل الضعف الجنسي، تأخر الإنجاب، ودوالي الخصية عند الرجال.', 'Treatment of erectile dysfunction, male infertility, and varicocele in men.', 'Heart', '/uploads/6d7561d2-1237-4761-a41a-211f9353a54d.webp', 5, TRUE, '2026-05-08T18:11:32.079Z', '2026-05-08T21:52:19.582Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eooe0004vfysuw8ehif1', 'سرطان البروستاتا وطرق العلاج', 'Prostate Cancer Diagnosis & Treatment', 'تشخيص وعلاج أورام وسرطان البروستاتا باستخدام أحدث البروتوكولات العالمية.', 'Diagnosis and treatment of prostate tumors and cancer using the latest international protocols.', 'Gem', '/uploads/1428039e-257b-4e3c-bde3-6e5a7b541e67.webp', 4, TRUE, '2026-05-08T18:11:32.078Z', '2026-05-08T21:52:29.717Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eooh0008vfyscija053c', 'استئصال البروستاتا بالمنظار', 'Laparoscopic Prostatectomy', 'إجراء عمليات البروستاتا المعقدة عن طريق فتحات صغيرة جداً باستخدام المنظار.', 'Performing complex prostate surgeries through tiny incisions using laparoscopic techniques.', 'Scan', '/uploads/3334fd45-3cba-498d-93a8-a99d33ce4ba7.webp', 8, TRUE, '2026-05-08T18:11:32.082Z', '2026-05-08T22:04:32.106Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eoog0006vfysgsqhwd6z', 'علاج سرطان المثانة', 'Bladder Cancer Treatment', 'استئصال أورام المثانة ومتابعتها لضمان الشفاء التام ومنع الارتجاع.', 'Surgical resection and follow-up of bladder tumors to ensure full recovery and prevent recurrence.', 'Shield', '/uploads/706a0c4a-edc7-422e-a12e-3ff916d544c1.webp', 6, TRUE, '2026-05-08T18:11:32.080Z', '2026-05-08T22:00:41.612Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eood0003vfysjmi7zuqm', 'تفتيت حصوات الجهاز البولي بالليزر', 'Laser Stone Fragmentation (HoLEP)', 'تفتيت حصوات الكلى، الحالب والمثانة باستخدام تقنية الهولميوم ليزر المتقدمة.', 'Fragmentation of kidney, ureter, and bladder stones using advanced Holmium laser technology.', 'Activity', '/uploads/18ff0541-288e-4adb-9f8b-db838b8a314b.webp', 3, TRUE, '2026-05-08T18:11:32.078Z', '2026-05-08T22:00:52.698Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eooc0002vfys0n6mzxf4', 'المنظار المرن وتفتيت الحصوات', 'Flexible Endoscopy & Stone Fragmentation', 'استخدام المناظير المرنة لتفتيت حصوات الكلى والحالب بدون جراحة.', 'Using flexible endoscopes to fragment kidney and ureteral stones without traditional surgery.', 'Scan', '/uploads/884fa43d-a802-4c51-ac53-ffde5c1e55e0.webp', 2, TRUE, '2026-05-08T18:11:32.077Z', '2026-05-08T22:01:00.686Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eooj000bvfysc1xosdlu', 'جراحة مسالك الأطفال', 'Pediatric Urology', 'علاج العيوب الخلقية والمشاكل التناسلية عند الأطفال بأعلى درجات الدقة.', 'Treating congenital defects and reproductive issues in children with maximum precision.', 'Stethoscope', '/uploads/e3142850-5a79-4ef4-9d64-c81c6cf3e099.webp', 11, TRUE, '2026-05-08T18:11:32.084Z', '2026-05-08T22:08:23.974Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eooi0009vfysi3f9skns', 'تقنية الريزوم (بخار الماء)', 'Rezum Water Vapor Therapy', 'أحدث علاج غير جراحي لتضخم البروستاتا باستخدام بخار الماء في دقائق معدودة.', 'The latest non-surgical treatment for prostate enlargement using water vapor in just minutes.', 'Activity', '/uploads/77cff812-31eb-4c63-89b0-dd7e3ddedbde.webp', 9, TRUE, '2026-05-08T18:11:32.082Z', '2026-05-08T22:08:24.114Z');
INSERT INTO "Service" ("id", "titleAr", "titleEn", "descriptionAr", "descriptionEn", "icon", "image", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmox8eooi000avfyszvrtc7ep', 'تقنية الايكو ليزر', 'EchoLaser Treatment', 'استخدام الموجات فوق الصوتية والليزر لعلاج تضخم البروستاتا بدون تخدير كلي.', 'Using ultrasound and laser for treating prostate enlargement without general anesthesia.', 'Scan', '/uploads/9c991376-55dd-4bd0-8aa6-3e6b562cf3ec.webp', 10, TRUE, '2026-05-08T18:11:32.083Z', '2026-05-08T22:08:24.120Z');

-- Data for table Media
INSERT INTO "Media" ("id", "type", "url", "titleAr", "titleEn", "categoryAr", "categoryEn", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmoxcsiua0001vfro0wsa00x5', 'image', '/uploads/clinic.webp', 'العيادة', 'The Clinic', 'المكان', 'Location', 0, TRUE, '2026-05-08T20:14:16.162Z', '2026-05-08T20:14:16.162Z');
INSERT INTO "Media" ("id", "type", "url", "titleAr", "titleEn", "categoryAr", "categoryEn", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmoxcsixr0002vfro7d3m7uu4', 'image', '/uploads/urology.webp', 'جراحة المسالك', 'Urology Surgery', 'الخدمات', 'Services', 0, TRUE, '2026-05-08T20:14:16.288Z', '2026-05-08T20:14:16.288Z');
INSERT INTO "Media" ("id", "type", "url", "titleAr", "titleEn", "categoryAr", "categoryEn", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmoxcsiqw0000vfropgejkflg', 'image', '/uploads/34d66a58-6270-4b59-a18a-371afa9aa9b9.webp', 'الدكتور أحمد عبد اللطيف', 'Dr. Ahmed Abdellatif', 'الموظفين', 'Staff', 0, TRUE, '2026-05-08T20:14:16.040Z', '2026-05-08T20:57:04.777Z');
INSERT INTO "Media" ("id", "type", "url", "titleAr", "titleEn", "categoryAr", "categoryEn", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmoxkz1dc000dvfj0qvdyasvy', 'image', '/uploads/4d019bc9-4433-4e7f-8b87-fbe1ec7ef1e2.webp', 'تجربة', 'test', '', '', 0, TRUE, '2026-05-09T00:03:17.040Z', '2026-05-09T00:03:17.040Z');
INSERT INTO "Media" ("id", "type", "url", "titleAr", "titleEn", "categoryAr", "categoryEn", "order", "isActive", "createdAt", "updatedAt") VALUES ('cmoxlfbxq0024vfj08mz5wnrt', 'video', '/uploads/0a487925-3c2f-415d-ba05-6ff38ec4a328.mp4', 'تجربة', 'test', '', '', 0, TRUE, '2026-05-09T00:15:57.230Z', '2026-05-09T00:15:57.230Z');

-- Data for table Testimonial
INSERT INTO "Testimonial" ("id", "patientName", "patientAvatar", "content", "rating", "isApproved", "isVisible", "createdAt", "updatedAt") VALUES ('cmoxlm40k0000vf54ez1ao40c', 'ziad khalifa', NULL, 'ty doc', 3, TRUE, TRUE, '2026-05-09T00:21:13.545Z', '2026-05-09T00:21:52.253Z');

-- Data for table SiteSettings
INSERT INTO "SiteSettings" ("key", "value") VALUES ('hero.subtitle', '{"ar":"أستاذ واستشاري جراحة المسالك البولية والكلى والمناظير والذكورة","en":"Professor & Consultant of Urology, Kidney Surgery, Endoscopy, and Andrology"}');
INSERT INTO "SiteSettings" ("key", "value") VALUES ('hero.image', '{"alt":"Dr. Ahmed Abdellatif","src":"/uploads/34d66a58-6270-4b59-a18a-371afa9aa9b9.webp"}');
INSERT INTO "SiteSettings" ("key", "value") VALUES ('about.image', '{"alt":"عن الأستاذ الدكتور أحمد عبد اللطيف","src":"/uploads/37e69707-afed-4e06-892d-2a42e3098df5.webp"}');
INSERT INTO "SiteSettings" ("key", "value") VALUES ('services.hero.image', '{"alt":"Services Hero","src":"/uploads/81ae528e-f43d-44a8-8c78-500b0cbc2c7b.webp"}');
INSERT INTO "SiteSettings" ("key", "value") VALUES ('about.hero.image', '{"alt":"Dr. Ahmed Abdellatif Clinic","src":"/uploads/662140f7-7d91-49ab-b1eb-15200e75363b.webp"}');

-- Data for table BlogPost
INSERT INTO "BlogPost" ("id", "titleAr", "titleEn", "slugAr", "slugEn", "contentAr", "contentEn", "excerptAr", "excerptEn", "metaTitleAr", "metaTitleEn", "metaDescriptionAr", "metaDescriptionEn", "keywords", "categoryId", "status", "featuredImage", "createdAt", "updatedAt") VALUES ('cmoxkx85s0008vfj0bkybaeq7', 'طريقك لصحة الكلى: فهم العلامات المبكرة وطرق الوقاية', 'The Path to Kidney Health: Understanding Early Signs and Prevention', 'طريقك-لصحة-الكلى-فهم-العلامات-المبكرة-وطرق-الوقاية', 'the-path-to-kidney-health-understanding-early-signs-and-prevention', '<h2><strong>لماذا تعتبر صحة الكلى أمراً حيوياً؟</strong></h2><p>تلعب الكلى دوراً حيوياً في الحفاظ على الصحة العامة من خلال تصفية الفضلات من الدم وتنظيم ضغط الدم. ومع ذلك، لا يدرك الكثير من الناس وجود مشاكل في الكلى حتى تصل إلى مراحل متقدمة.</p><h3><strong>علامات شائعة يجب مراقبتها</strong></h3><ul><li><p>تغيرات في عدد مرات التبول أو لون البول.</p></li><li><p>تورم في الكاحلين أو القدمين أو الساقين.</p></li><li><p>التعب المستمر والضعف العام.</p></li><li><p>ضيق التنفس دون سبب واضح.</p></li></ul><p>الكشف المبكر من خلال الفحوصات الدورية هو أفضل وسيلة للوقاية من أمراض الكلى المزمنة. استشر الدكتور أحمد اليوم إذا كنت تعاني من أي من هذه الأعراض.</p><p></p>', '<h2><strong>Why Kidney Health Matters</strong></h2><p>The kidneys play a vital role in maintaining overall health by filtering waste products from the blood and regulating blood pressure. However, many people are unaware of kidney issues until they reach advanced stages.</p><h3><strong>Common Signs to Watch For</strong></h3><ul><li><p>Changes in urination frequency or color.</p></li><li><p>Swelling in the ankles, feet, or legs.</p></li><li><p>Persistent fatigue and weakness.</p></li><li><p>Shortness of breath without clear cause.</p></li><li><p>Early detection through regular check-ups is the best way to prevent chronic kidney disease. Consult Dr. Ahmed today if you experience any of these symptoms.</p></li></ul><p></p>', 'كليتاك هما الفلتر الصامت لجسمك. تعرف على أهمية الكشف المبكر وكيف يمكن لتغييرات بسيطة في نمط الحياة أن تحمي صحة كليتيك.', 'Your kidneys are the silent filters of your body. Learn why early detection is crucial and how simple lifestyle changes can protect your renal health.', ' صحة الكلى وطرق الوقاية | د. أحمد عبداللطيف', 'kidney health prevention', 'صحة الكلى، أمراض الكلى، الكشف المبكر، نصائح طبية، kidney health, urology.', 'صحة الكلى، أمراض الكلى، الكشف المبكر، نصائح طبية، kidney health, urology.', 'صحة الكلى، أمراض الكلى، الكشف المبكر، نصائح طبية، kidney health, urology.', NULL, 'published', '/uploads/4d019bc9-4433-4e7f-8b87-fbe1ec7ef1e2.webp', '2026-05-09T00:01:52.527Z', '2026-05-09T00:03:32.906Z');

-- Data for table Appointment
INSERT INTO "Appointment" ("id", "type", "patientId", "guestName", "guestPhone", "guestEmail", "date", "timeSlot", "status", "notes", "meetingId", "meetingUrl", "createdAt", "updatedAt") VALUES ('cmoxjpbsp000lvfjk2va1vd0u', 'IN_CLINIC', NULL, NULL, NULL, NULL, '2026-05-09T00:00:00.000Z', '09:00', 'pending', '2001', NULL, NULL, '2026-05-08T23:27:44.377Z', '2026-05-08T23:27:44.377Z');

SET session_replication_role = 'origin';