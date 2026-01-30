import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Request, Response } from 'express';
import { env } from 'src/config/env';
import { ObjectErrMsgType } from './common.type';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';

    // DEV MODE → expose detailed error messages
    if (env.NODE_ENV === 'dev') {
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const errorResponse = exception.getResponse() as
          | ObjectErrMsgType
          | string;

        if (typeof errorResponse === 'string') {
          message = errorResponse;
        } else if (Array.isArray(errorResponse?.message)) {
          message = errorResponse.message.join(', ');
        } else if (typeof errorResponse?.message === 'string') {
          message = errorResponse.message;
        } else {
          message = exception.message;
        }
      } else if (exception instanceof Error) {
        message = exception.message;
      }
      response.status(status).json({
        status,
        success: false,
        message,
        path: request.url,
        data: null,
      });
      return;
    }

    // NON-DEV → hide details, report to Sentry
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    Sentry.captureException(exception);

    response.status(status).json({
      status,
      success: false,
      message: 'Internal server error',
      path: request.url,
      data: null,
    });
  }
}
