import * as fs from 'fs';
import { resolve } from 'path';

const schema = fs.readFileSync(resolve(__dirname, '../prisma/supabase_schema.sql'), 'utf8');
const data = fs.readFileSync(resolve(__dirname, '../supabase_import.sql'), 'utf8');

fs.writeFileSync(resolve(__dirname, '../FINAL_SUPABASE_IMPORT.sql'), schema + '\n' + data);
console.log('✅ Final Supabase SQL file created: FINAL_SUPABASE_IMPORT.sql');
