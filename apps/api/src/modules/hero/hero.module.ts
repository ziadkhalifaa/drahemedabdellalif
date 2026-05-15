import { Module } from '@nestjs/common';
import { HeroService } from './application/hero.service';
import { HeroController } from './infrastructure/hero.controller';

@Module({
  providers: [HeroService],
  controllers: [HeroController]
})
export class HeroModule {}
