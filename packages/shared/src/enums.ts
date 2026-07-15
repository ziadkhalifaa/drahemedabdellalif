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

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethodType {
  NONE = 'NONE',
  INSTAPAY = 'INSTAPAY',
  VODAFONE_CASH = 'VODAFONE_CASH',
  PAYMOB = 'PAYMOB',
  CASH = 'CASH',
}

export enum PaymentConfirmStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export const AppointmentStatusValues = [
  'pending', 'approved', 'rejected', 'completed', 'cancelled',
] as const;

export const PaymentStatusValues = [
  'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED',
] as const;
