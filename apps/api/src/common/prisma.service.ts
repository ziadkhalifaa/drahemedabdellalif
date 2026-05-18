import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('[PRISMA-DEBUG] Initiating background database connection...');
    this.$connect()
      .then(() => {
        console.log('[PRISMA-DEBUG] Database connected successfully!');
      })
      .catch((error) => {
        console.error('[PRISMA-DEBUG] Database connection failed:', (error as Error).message);
      });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
