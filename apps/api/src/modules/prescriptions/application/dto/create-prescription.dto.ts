import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

class MedicationItem {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name!: string;

  @IsString()
  @IsNotEmpty()
  dosage!: string;

  @IsString()
  @IsNotEmpty()
  duration!: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePrescriptionDto {
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsOptional()
  diagnosisAr?: string;

  @IsString()
  @IsOptional()
  diagnosisEn?: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MedicationItem)
  medications!: MedicationItem[];

  @IsString()
  @IsOptional()
  instructionsAr?: string;

  @IsString()
  @IsOptional()
  instructionsEn?: string;
}
