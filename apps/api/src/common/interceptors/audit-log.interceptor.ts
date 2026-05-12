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

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Only log admin/editor actions for POST, PUT, PATCH, DELETE
    if (!user || user.role === 'patient' || request.method === 'GET') {
      return next.handle();
    }

    const { method, url, body, ip } = request;

    return next.handle().pipe(
      tap(() => {
        // Log the action after successful completion
        this.prisma.auditLog.create({
          data: {
            userId: user.sub || user.id,
            action: `${method} ${url}`,
            resource: url.split('/')[2] || 'unknown',
            details: body,
            ip: ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress,
          },
        }).catch(err => console.error('Failed to save audit log:', err));
      }),
    );
  }
}
