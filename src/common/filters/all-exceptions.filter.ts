import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: {
      statusCode: number;
      timestamp: string;
      path: string;
      message: string | string[];
    } = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Validasyon hatalarını veya diğer HttpException detaylarını işliyoruz
      if (typeof exceptionResponse === 'string') {
        errorResponse.message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;

        if (Array.isArray(responseObj.message)) {
          // Validasyon hatalarının dizisini döndür
          errorResponse.message = responseObj.message;
        } else {
          // Tek bir hata mesajı varsa
          errorResponse.message = responseObj.message || 'An error occurred';
        }
      }
    } else if (exception instanceof Error) {
      // JavaScript hataları için
      errorResponse.message = exception.message;
    }

    console.error(exception);

    response.status(status).json(errorResponse);
  }
}
