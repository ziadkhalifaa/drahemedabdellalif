/**
 * Local shim for @dr-ahmed/shared
 * Used in standalone (non-monorepo) deployments like Hostinger.
 * Keep this in sync with packages/shared/src/
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const APP_NAME = 'Dr. Ahmed Abdellatif';
export const APP_DESC = 'Consultant Urologist, Kidney Surgery, Endoscopy, Andrology & Sexual Health';
export const APP_LOCALE = 'ar-EG';

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00',
] as const;

export const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

export const WHATSAPP_NUMBER = '+201002621743';
export const CLINIC_ADDRESS = 'Beni Suef, Egypt';
export const CLINIC_PHONE = '+201002621743';
export const CLINIC_EMAIL = 'info@drahmedabdellatif.com';

export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ar';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum AppointmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AppointmentType {
  ONLINE = 'ONLINE',
  IN_CLINIC = 'IN_CLINIC',
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  PATIENT = 'patient',
}

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface Appointment {
  id: string;
  type: AppointmentType;
  patientId?: string;
  patient?: User;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  meetingId?: string;
  meetingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patient?: User;
  title: string;
  description?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  titleAr: string;
  titleEn: string;
  slugAr: string;
  slugEn: string;
  contentAr: string;
  contentEn: string;
  excerptAr?: string;
  excerptEn?: string;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
  keywords?: string;
  status: BlogPostStatus;
  featuredImage?: string;
  showOnHomepage?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  patientAvatar?: string;
  content: string;
  rating: number;
  isApproved: boolean;
  isVisible: boolean;
  isSuccessStory?: boolean;
  storyTitle?: string;
  storyTitleEn?: string;
  storyContent?: string;
  storyContentEn?: string;
  patientImages?: string[];
  patientCity?: string;
  treatmentType?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HeroSlide {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  isPortrait: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Technique {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
