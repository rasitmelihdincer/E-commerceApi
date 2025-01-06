import { Admin } from '@prisma/client';
import { AdminEntity } from '../entities/admin.entity';
import { AdminDto } from '../dto/admin.dto';

export class AdminMapper {
  static toEntity(prismaAdmin: Admin): AdminEntity {
    return new AdminEntity(
      prismaAdmin.id,
      prismaAdmin.firstName,
      prismaAdmin.lastName,
      prismaAdmin.email,
      prismaAdmin.hashedPassword,
      prismaAdmin.createdAt,
      prismaAdmin.updatedAt,
    );
  }

  static toDto(entity: AdminEntity): AdminDto {
    const dto = new AdminDto();
    dto.id = entity.id;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.email = entity.email;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static toDtoList(entities: AdminEntity[]): AdminDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  static toEntityList(prismaAdmins: Admin[]): AdminEntity[] {
    return prismaAdmins.map((admin) => this.toEntity(admin));
  }
}
