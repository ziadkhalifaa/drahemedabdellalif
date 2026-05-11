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

  sqlLines.push('SET FOREIGN_KEY_CHECKS = 0;');

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
        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
        return val;
      });
      sqlLines.push(`INSERT INTO \`${tableName}\` (\`${keys.join('`, `')}\`) VALUES (${values.join(', ')});`);
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

  sqlLines.push('\nSET FOREIGN_KEY_CHECKS = 1;');

  const sqlPath = resolve(__dirname, '../alraheeq_database.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n'));
  
  console.log(`✅ SQL file generated: ${sqlPath}`);
}

main();
