import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationErrorResponse {
  message: string | string[];
  fields?: Record<string, string[]>;
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  fields?: Record<string, string[]>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let fields: Record<string, string[]> | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const validationResponse = exceptionResponse as ValidationErrorResponse;
        message = Array.isArray(validationResponse.message)
          ? validationResponse.message.join(', ')
          : validationResponse.message || exception.message || 'Bad Request';
        fields = validationResponse.fields;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log do erro
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(fields && { fields }),
    };

    response.status(status).json(errorResponse);
  }
}
