import { Injectable } from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(customerId: number): Promise<string> {
    const token = randomUUID();
    const expiresAt = addMinutes(new Date(), 60);
    await this.sessionRepository.create(customerId, token, expiresAt);
    return token;
  }

  async validateToken(token: string): Promise<number | null> {
    const session = await this.sessionRepository.findByToken(token);
    if (!session) return null;
    const now = new Date();
    if (session.expiresAt < now) {
      return null;
    }
    return session.customerId;
  }

  async deleteSession(token: string): Promise<void> {
    await this.sessionRepository.deleteByToken(token);
  }
}
