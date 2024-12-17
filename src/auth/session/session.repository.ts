import { Injectable } from "@nestjs/common";
import { Session } from "@prisma/client";
import { PrismaService } from "src/shared/prisma/prisma.service";


@Injectable()
export class SessionRepository {
    constructor(private readonly prisma: PrismaService) {}
    
    async create(customerId: number, token: string , expiresAt: Date) : Promise<Session>{
        return this.prisma.session.create({
            data: {
                customerId,
                token,
                createdAt: new Date(),
                expiresAt,
            }
        });
    }

    async findByToken(token: string): Promise<Session | null> {
        return this.prisma.session.findUnique({
          where: { token },
        });
      }

      async deleteByToken(token: string): Promise<void> {
        await this.prisma.session.delete({
          where: { token },
        });
      }
}