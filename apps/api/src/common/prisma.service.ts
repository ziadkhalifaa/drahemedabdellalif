import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
// @ts-ignore
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Use pg driver adapter (pure Node.js) to avoid Rust/Tokio thread spawning
    // required on Hostinger shared hosting which blocks os thread creation (EAGAIN)
    const isServerless = !!process.env.VERCEL;
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: isServerless ? 3 : 10,
      idleTimeoutMillis: isServerless ? 5000 : 15000,
      connectionTimeoutMillis: 15000,
    });

    const adapter = new PrismaPg(pool);

    super({ adapter } as any);
  }

  async onModuleInit() {
    console.log('[PRISMA-DEBUG] Initiating background database connection (pg adapter)...');
    this.$connect()
      .then(() => {
        console.log('[PRISMA-DEBUG] Database connected successfully via pg adapter!');
      })
      .catch((error) => {
        console.error('[PRISMA-DEBUG] Database connection failed:', (error as Error).message);
      });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
