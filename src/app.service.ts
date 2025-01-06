import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    const port = this.configService.get<string>('PORT');
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST');

    return `Application Configuration:
    - Port: ${port}
    - Database URL: ${databaseUrl}
    - Redis Host: ${redisHost}`;
  }
}
