import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SessionType } from 'src/shared/enum/session-type.enum';

export interface SessionData {
  type: SessionType;
  adminId?: number;
  customerId?: number;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class SessionRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async create(
    sessionId: string,
    type: SessionType,
    expiresAt: Date,
    adminId?: number,
    customerId?: number,
  ): Promise<SessionData> {
    const sessionData: SessionData = {
      type,
      adminId,
      customerId,
      createdAt: new Date(),
      expiresAt,
    };

    const ttlSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    await this.cacheManager.set(
      `session_${sessionId}`,
      sessionData,
      ttlSeconds,
    );
    return sessionData;
  }

  async findBySessionId(sessionId: string): Promise<SessionData | null> {
    const session = await this.cacheManager.get<SessionData>(
      `session_${sessionId}`,
    );
    if (!session) return null;

    // Süre kontrolü
    if (session.expiresAt < new Date()) {
      await this.deleteBySessionId(sessionId);
      return null;
    }

    return session;
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    await this.cacheManager.del(`session_${sessionId}`);
  }
}
