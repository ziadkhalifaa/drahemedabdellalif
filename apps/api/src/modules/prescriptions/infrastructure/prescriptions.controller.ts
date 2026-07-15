import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrescriptionsService } from '../application/prescriptions.service';
import { CreatePrescriptionDto } from '../application/dto/create-prescription.dto';
import { RolesGuard, Roles } from '../../../common/decorators';

@Controller('prescriptions')
@UseGuards(AuthGuard('jwt'))
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  async create(@Body() body: CreatePrescriptionDto) {
    return this.prescriptionsService.create(body);
  }

  @Get('my')
  async getMy(@Request() req: any) {
    return this.prescriptionsService.getMyPrescriptions(req.user.sub || req.user.id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Get('by-appointment/:appointmentId')
  async getByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.prescriptionsService.findByAppointment(appointmentId);
  }

  @Get('patient/:patientId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  async getByPatient(@Param('patientId') patientId: string) {
    return this.prescriptionsService.findByPatient(patientId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  async findAll() {
    return this.prescriptionsService.findAll();
  }
}
