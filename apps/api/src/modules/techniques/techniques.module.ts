import { Module } from '@nestjs/common';
import { TechniquesService } from './application/techniques.service';
import { TechniquesController } from './infrastructure/techniques.controller';

@Module({
  providers: [TechniquesService],
  controllers: [TechniquesController]
})
export class TechniquesModule {}
