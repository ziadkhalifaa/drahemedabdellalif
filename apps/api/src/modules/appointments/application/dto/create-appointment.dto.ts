import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { AppointmentType } from '@dr-ahmed/shared';

export class CreateAppointmentDto {
  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  guestName?: string;

  @IsString()
  @IsOptional()
  guestPhone?: string;

  @IsString()
  @IsOptional()
  guestEmail?: string;

  @IsEnum(AppointmentType)
  @IsNotEmpty()
  type!: AppointmentType;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  timeSlot!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  paymentSenderNum?: string;

  @IsString()
  @IsOptional()
  paymentProofUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  depositAmount?: number;
}
