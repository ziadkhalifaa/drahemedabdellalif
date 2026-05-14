
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportData() {
  console.log('🚀 Starting database export...');
  const data = {};

  try {
    // List of models to export
    const models = [
      'user',
      'service',
      'appointment',
      'blogPost',
      'blogTag',
      'category',
      'contactMessage',
      'media',
      'medicalReport',
      'refreshToken',
      'siteSettings',
      'testimonial',
      'workingHours',
      'prescription',
      'payment'
    ];

    for (const model of models) {
      console.log(`📦 Fetching ${model}...`);
      try {
        data[model] = await prisma[model].findMany();
      } catch (err) {
        console.error(`❌ Failed to fetch ${model}:`, err.message);
      }
    }

    const outputPath = path.join(process.cwd(), 'database_backup.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Export complete! File saved to: ${outputPath}`);
    console.log(`📊 Total records exported: ${Object.values(data).flat().length}`);
  } catch (error) {
    console.error('💥 Critical error during export:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
