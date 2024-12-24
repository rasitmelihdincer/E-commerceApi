import { HttpException, HttpStatus } from '@nestjs/common';

throw new HttpException(
  {
    status: 450,
    error: 'Invalid Product ID',
    message: 'The provided product ID is invalid or not found.',
  },
  450,
);
