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
