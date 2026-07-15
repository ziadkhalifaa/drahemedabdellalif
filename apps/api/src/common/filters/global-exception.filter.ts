import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'object' ? (message as any).message : (status >= 500 ? 'Internal server error' : message),
      error: typeof message === 'object' ? (message as any).error : (status >= 500 ? null : undefined),
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - Error: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - Warning: ${exception.message}`,
      );
    }

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      response.header('Retry-After', '60');
    }

    response.status(status).json(errorResponse);
  }
}
