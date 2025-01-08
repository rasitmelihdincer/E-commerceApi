import { SetMetadata } from '@nestjs/common';
import { SessionType } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: SessionType[]) => SetMetadata(ROLES_KEY, roles);
