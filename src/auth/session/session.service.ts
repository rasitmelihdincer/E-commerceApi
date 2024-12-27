import { Injectable } from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { JwtService } from '@nestjs/jwt';
import { addMinutes } from 'date-fns';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createSession(customerId: number): Promise<string> {
    const expiresAt = addMinutes(new Date(), 60);

    // JWT token oluştur
    const token = this.jwtService.sign(
      {
        sub: customerId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
      {
        // expiresIn seçeneğini kullanmıyoruz çünkü exp zaten payload'da var
      },
    );

    // Token'ı Redis'e kaydet
    await this.sessionRepository.create(customerId, token, expiresAt);
    return token;
  }

  async validateToken(token: string): Promise<number | null> {
    try {
      // JWT token'ı doğrula
      const payload = this.jwtService.verify(token);

      // Redis'ten session kontrolü
      const session = await this.sessionRepository.findByToken(token);
      if (!session) return null;

      return payload.sub;
    } catch (error) {
      return null;
    }
  }

  async deleteSession(token: string): Promise<void> {
    await this.sessionRepository.deleteByToken(token);
  }
}
