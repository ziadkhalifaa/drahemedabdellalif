import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class StorageService {
  private supabase = createClient(
    process.env.SUPABASE_URL || 'https://dkqmympallxpdfypwxlr.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || 'placeholder',
    {
      auth: {
        persistSession: false,
      },
      realtime: {
        transport: WebSocket,
      },
    }
  );
  private bucket = 'media';

  async saveImage(file: Express.Multer.File): Promise<string> {
    const filename = `${randomUUID()}.webp`;
    const buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(`images/${filename}`, buffer, { contentType: 'image/webp', upsert: false });
    if (error) throw new InternalServerErrorException('Image upload failed: ' + error.message);
    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(`images/${filename}`);
    return data.publicUrl;
  }

  async saveVideo(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(`videos/${filename}`, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw new InternalServerErrorException('Video upload failed: ' + error.message);
    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(`videos/${filename}`);
    return data.publicUrl;
  }

  async deleteFile(url: string): Promise<void> {
    // Extract path from Supabase public URL
    const pathMatch = url.match(/\/storage\/v1\/object\/public\/media\/(.+)/);
    if (!pathMatch) return;
    await this.supabase.storage.from(this.bucket).remove([pathMatch[1]]);
  }

  async uploadFile(file: Express.Multer.File, folder = ''): Promise<string> {
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const storagePath = folder ? `${folder}/${filename}` : filename;
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw new InternalServerErrorException('File upload failed: ' + error.message);
    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(storagePath);
    return data.publicUrl;
  }
}
