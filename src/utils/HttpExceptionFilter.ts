import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter {
  private isHttpException(exception: unknown): exception is HttpException {
    return exception instanceof HttpException;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.isHttpException(exception)
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (this.isHttpException(exception)) {
      const errorResponse = exception.getResponse() as { message: any };
      const statusCode = exception.getStatus();
      return response.status(statusCode).json({
        status: 'fail',
        statusCode,
        data: errorResponse.message,
      });
    }

    return response.status(status).json({
      status: 'error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
