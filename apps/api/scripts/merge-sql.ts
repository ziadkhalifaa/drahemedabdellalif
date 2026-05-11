import * as fs from 'fs';
import { resolve } from 'path';

const schema = fs.readFileSync(resolve(__dirname, '../prisma/mysql_schema.sql'), 'utf8');
const data = fs.readFileSync(resolve(__dirname, '../alraheeq_database.sql'), 'utf8');

fs.writeFileSync(resolve(__dirname, '../FINAL_DATABASE_IMPORT.sql'), schema + '\n' + data);
console.log('✅ Final SQL file created: FINAL_DATABASE_IMPORT.sql');
