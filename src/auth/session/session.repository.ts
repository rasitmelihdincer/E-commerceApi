import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

export interface SessionData {
  customerId: number;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class SessionRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async create(
    customerId: number,
    token: string,
    expiresAt: Date,
  ): Promise<SessionData> {
    const sessionData: SessionData = {
      customerId,
      createdAt: new Date(),
      expiresAt,
    };

    const ttlSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    await this.cacheManager.set(`session_${token}`, sessionData, ttlSeconds);

    return sessionData;
  }

  async findByToken(token: string): Promise<SessionData | null> {
    const session = await this.cacheManager.get<SessionData>(
      `session_${token}`,
    );
    if (!session) return null;

    // Süre kontrolü
    if (session.expiresAt < new Date()) {
      await this.deleteByToken(token);
      return null;
    }

    return session;
  }

  async deleteByToken(token: string): Promise<void> {
    await this.cacheManager.del(`session_${token}`);
  }
}
