import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SimpleCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly TTL = 1000 * 60 * 5; // 5 minutes

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const key = request.url;
    const cached = this.cache.get(key);

    if (cached && cached.expiry > Date.now()) {
      return of(cached.data);
    }

    return next.handle().pipe(
      tap((data) => {
        this.cache.set(key, {
          data,
          expiry: Date.now() + this.TTL,
        });
      }),
    );
  }
}
