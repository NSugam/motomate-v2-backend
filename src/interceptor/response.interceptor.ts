/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import {
  SuccessResponse,
  SuccessResponseMultiple,
} from 'src/interface.ts/response.interface';

@Injectable()
export class SuccessResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponseMultiple<T> | SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponseMultiple<T> | SuccessResponse<T>> {
    const { query } = context.switchToHttp().getRequest();
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((responseObject) => {
        const response = context.switchToHttp().getResponse();

        // Handle paginated responses [data, count] or [data, message, count]
        if (
          Array.isArray(responseObject) &&
          typeof responseObject[1] !== 'undefined'
        ) {
          const [datas, length, messageFromService] = responseObject;

          const page = Number(query.page) || 1;
          const take = Number(query.take) || length || 1;
          const totalPages = Math.ceil(length / take);

          const meta = {
            length,
            totalPages,
            prev: page > 1 ? page - 1 : null,
            next: page < totalPages ? page + 1 : null,
          };

          return new SuccessResponseMultiple({
            status: response.statusCode,
            success: response.statusCode >= 200 && response.statusCode < 300,
            meta,
            message: req.customMessage || messageFromService || 'success',
            data: datas,
          });
        }

        // Handle controller/service returning { data, message } or single object
        const message =
          req.customMessage || responseObject?.message || 'success';
        delete responseObject?.message;

        return new SuccessResponse({
          status: response.statusCode || responseObject?.status || 200,
          message,
          data: responseObject?.data || responseObject || null,
        });
      }),
    );
  }
}
