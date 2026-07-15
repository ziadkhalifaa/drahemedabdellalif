import { Controller, Get, Post, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { RolesGuard, Roles } from '../../common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('my')
  async getMyReports(@Req() req: any) {
    return this.reportsService.getMyReports(req.user.id);
  }

  @Get('by-appointment/:appointmentId')
  async getByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.reportsService.findByAppointment(appointmentId);
  }

  @Get(':id')
  async getReportById(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.reportsService.findAll(+page, +limit);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() body: { title: string; patientId: string; description?: string; appointmentId?: string },
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    const userRole = req.user.role;
    const patientId = userRole === 'patient' ? req.user.id : body.patientId;
    
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    return this.reportsService.create({ ...body, patientId }, file);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
