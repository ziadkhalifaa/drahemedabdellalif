import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function fullBackup() {
  console.log('🚀 Starting Full Database Export...');
  let sqlContent = '-- Full Database Dump\n\n';

  // 1. نجيب كل أسماء الجداول من الداتا بيز نفسها
  const tables: any[] = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE '_prisma_migrations';
  `;

  for (const t of tables) {
    const tableName = t.table_name;
    console.log(`📦 Exporting: ${tableName}...`);
    
    const data: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
    
    if (data.length === 0) continue;

    sqlContent += `-- Data for ${tableName}\n`;
    for (const row of data) {
      const columns = Object.keys(row).map(c => `"${c}"`).join(', ');
      const values = Object.values(row).map(val => {
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (val instanceof Date) return `'${val.toISOString()}'`;
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return val;
      }).join(', ');
      
      sqlContent += `INSERT INTO "${tableName}" (${columns}) VALUES (${values});\n`;
    }
    sqlContent += '\n';
  }

  fs.writeFileSync('complete_supabase_backup.sql', sqlContent);
  console.log('✅ Done! All tables exported to: complete_supabase_backup.sql');
}

fullBackup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
