import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminDto } from './dto/admin.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { SessionType } from '@prisma/client';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard)
@Roles(SessionType.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 200, type: [AdminDto] })
  async list() {
    return {
      data: await this.adminService.list(),
    };
  }
  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, type: AdminDto })
  async create(@Body() createAdminDto: CreateAdminDto) {
    return {
      message: 'Admin created successfully',
      data: await this.adminService.create(createAdminDto),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin' })
  @ApiResponse({ status: 200, type: AdminDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return {
      message: 'Admin updated successfully',
      data: await this.adminService.update(id, updateAdminDto),
    };
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin' })
  @ApiResponse({ status: 200 })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.delete(id);
    return {
      message: 'Admin deleted successfully',
    };
  }

  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({ status: 200, type: AdminDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      data: await this.adminService.findById(id),
    };
  }
}
