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
      let message = 'Internal server error';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();
        
        if (typeof exceptionResponse === 'string') {
          message = exceptionResponse;
        } else if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
          message = exceptionResponse.message;
        } else {
          message = exception.message || 'Error occurred';
        }
      } else if (exception instanceof Error) {
        message = exception.message;
      }
  
      console.error(exception);
  
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message,
      });
    }
  }
  