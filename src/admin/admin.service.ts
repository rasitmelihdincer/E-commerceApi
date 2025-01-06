// src/admin/admin.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminDto } from './dto/admin.dto';
import { AdminMapper } from './mappers/admin.mapper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async create(createAdminDto: CreateAdminDto): Promise<AdminDto> {
    const existingAdmin = await this.adminRepository.findByEmail(
      createAdminDto.email,
    );
    if (existingAdmin) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    const admin = await this.adminRepository.create(
      createAdminDto,
      hashedPassword,
    );
    return AdminMapper.toDto(admin);
  }

  async findByEmail(email: string): Promise<AdminDto | null> {
    const admin = await this.adminRepository.findByEmail(email);
    return admin ? AdminMapper.toDto(admin) : null;
  }

  async findById(id: number): Promise<AdminDto> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return AdminMapper.toDto(admin);
  }

  async list(): Promise<AdminDto[]> {
    const admins = await this.adminRepository.list();
    return AdminMapper.toDtoList(admins);
  }

  async update(id: number, updateAdminDto: UpdateAdminDto): Promise<AdminDto> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    let hashedPassword: string | undefined;
    if (updateAdminDto.password) {
      hashedPassword = await bcrypt.hash(updateAdminDto.password, 10);
      delete updateAdminDto.password;
    }

    const updatedAdmin = await this.adminRepository.update(
      id,
      updateAdminDto,
      hashedPassword,
    );
    return AdminMapper.toDto(updatedAdmin);
  }

  async delete(id: number): Promise<void> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    await this.adminRepository.delete(id);
  }

  async validatePassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
