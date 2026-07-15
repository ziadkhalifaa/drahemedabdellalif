import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): any {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || user.role === 'patient' || request.method === 'GET') {
      return next.handle();
    }

    const { method, url, body, ip } = request;
    const userId = user.sub || user.id;

    const safeDetails = body && typeof body === 'object'
      ? Object.fromEntries(
          Object.entries(body).filter(([key]) =>
            !['password', 'token', 'secret', 'authorization', 'code'].includes(key.toLowerCase())
          )
        )
      : body;

    return (next.handle() as any).pipe(
      tap(() => {
        this.prisma.auditLog.create({
          data: {
            userId,
            action: `${method} ${url}`,
            resource: url.split('/')[2] || 'unknown',
            details: method === 'POST' || method === 'PATCH' || method === 'PUT' ? safeDetails : null,
            ip: ip || request.headers['x-forwarded-for'] || (request as any).connection?.remoteAddress,
          },
        }).catch((err: any) => console.error('Failed to save audit log:', err));
      }),
    ) as any;
  }
}
