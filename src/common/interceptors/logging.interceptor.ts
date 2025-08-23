import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const method = request.method;
    const url = request.url;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = request.body;
    const requestId = uuidv4();

    // Adiciona requestId ao objeto request para uso posterior
    request.requestId = requestId;

    const now = Date.now();

    // Log da requisição
    this.logger.log(
      `[${requestId}] ${method} ${url} - Body: ${JSON.stringify(body)}`,
    );

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `[${request.requestId}] ${method} ${url} - Response time: ${responseTime}ms`,
        );
      }),
    );
  }
}
