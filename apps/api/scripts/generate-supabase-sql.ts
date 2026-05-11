import * as fs from 'fs';
import { resolve } from 'path';

async function main() {
  const backupPath = resolve(__dirname, '../backup_data.json');
  if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup file not found.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const sqlLines: string[] = [];

  // PostreSQL doesn't use FOREIGN_KEY_CHECKS, it uses session settings
  sqlLines.push('SET session_replication_role = \'replica\';');

  const generateInserts = (tableName: string, records: any[]) => {
    if (!records || records.length === 0) return;
    
    sqlLines.push(`\n-- Data for table ${tableName}`);
    records.forEach(record => {
      const keys = Object.keys(record);
      const values = keys.map(key => {
        const val = record[key];
        if (val === null) return 'NULL';
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (val instanceof Date) return `'${val.toISOString()}'`;
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        return val;
      });
      sqlLines.push(`INSERT INTO "${tableName}" ("${keys.join('", "')}") VALUES (${values.join(', ')});`);
    });
  };

  generateInserts('Category', data.categories);
  generateInserts('Tag', data.tags);
  generateInserts('User', data.users);
  generateInserts('Service', data.services);
  generateInserts('Media', data.media);
  generateInserts('Testimonial', data.testimonials);
  generateInserts('ContactMessage', data.contactMessages);
  generateInserts('SiteSettings', data.siteSettings);
  generateInserts('BlogPost', data.blogPosts);
  generateInserts('BlogTag', data.blogTags);
  generateInserts('Appointment', data.appointments);
  generateInserts('MedicalReport', data.medicalReports);

  sqlLines.push('\nSET session_replication_role = \'origin\';');

  const sqlPath = resolve(__dirname, '../supabase_import.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n'));
  
  console.log(`✅ Supabase SQL file generated: ${sqlPath}`);
}

main();
