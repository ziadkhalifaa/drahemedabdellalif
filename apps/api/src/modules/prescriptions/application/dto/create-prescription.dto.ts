import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreatePrescriptionDto {
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;

  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsOptional()
  diagnosisAr?: string;

  @IsString()
  @IsOptional()
  diagnosisEn?: string;

  @IsArray()
  @IsNotEmpty()
  medications: {
    name: string;
    dosage: string;
    duration: string;
    notes?: string;
  }[];

  @IsString()
  @IsOptional()
  instructionsAr?: string;

  @IsString()
  @IsOptional()
  instructionsEn?: string;
}
