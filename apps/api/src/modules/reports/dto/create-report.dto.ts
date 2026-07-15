import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;
}
