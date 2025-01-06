import { Injectable } from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { JwtService } from '@nestjs/jwt';
import { addMinutes } from 'date-fns';
import { v4 } from 'uuid';
import { SessionType } from 'src/shared/enum/session-type.enum';

export interface SessionPayload {
  type: SessionType;
  customerId?: number;
  sessionId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createCustomerSession(customerId: number): Promise<string> {
    const expiresAt = addMinutes(new Date(), 60);
    const sessionId = v4();
    // JWT token oluştur
    const payload: SessionPayload = {
      type: SessionType.CUSTOMER,
      customerId,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    };

    const token = this.jwtService.sign(payload);
    await this.sessionRepository.create(
      sessionId,
      SessionType.CUSTOMER,
      expiresAt,
      undefined,
      customerId,
    );
    return token;
  }
  async createAdminSession(adminId: number): Promise<string> {
    const expiresAt = addMinutes(new Date(), 60);
    const sessionId = v4();

    const payload: SessionPayload = {
      type: SessionType.ADMIN,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
      // ADMIN için adminId; isterseniz customerId boş bırakabilirsiniz
    };

    const token = this.jwtService.sign(payload);

    await this.sessionRepository.create(
      sessionId,
      SessionType.ADMIN,
      expiresAt,
      adminId,
      undefined,
    );

    return token;
  }

  async validateToken(token: string): Promise<SessionPayload | null> {
    try {
      const payload = this.jwtService.verify<SessionPayload>(token);
      // sessionId üzerinden Redis’ten session datasını al
      const sessionData = await this.sessionRepository.findBySessionId(
        payload.sessionId,
      );
      if (!sessionData) return null;

      return payload;
    } catch (e) {
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.sessionRepository.deleteBySessionId(sessionId);
  }
}
