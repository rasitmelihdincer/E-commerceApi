// src/admin/admin.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AdminEntity } from './entities/admin.entity';
import { AdminMapper } from './mappers/admin.mapper';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateAdminDto,
    hashedPassword: string,
  ): Promise<AdminEntity> {
    const admin = await this.prisma.admin.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        hashedPassword,
      },
    });
    return AdminMapper.toEntity(admin);
  }

  async findByEmail(email: string): Promise<AdminEntity | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });
    return admin ? AdminMapper.toEntity(admin) : null;
  }

  async findById(id: number): Promise<AdminEntity | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    return admin ? AdminMapper.toEntity(admin) : null;
  }

  async list(): Promise<AdminEntity[]> {
    const admins = await this.prisma.admin.findMany();
    return AdminMapper.toEntityList(admins);
  }

  async update(
    id: number,
    dto: UpdateAdminDto,
    hashedPassword?: string,
  ): Promise<AdminEntity> {
    const data: any = {
      ...dto,
    };

    if (hashedPassword) {
      data.hashedPassword = hashedPassword;
    }

    const admin = await this.prisma.admin.update({
      where: { id },
      data,
    });
    return AdminMapper.toEntity(admin);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.admin.delete({
      where: { id },
    });
  }
}
