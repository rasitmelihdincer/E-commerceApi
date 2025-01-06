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

@ApiTags('Admin Management')
@Controller('admin/management')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, type: AdminDto })
  async create(@Body() createAdminDto: CreateAdminDto) {
    return {
      message: 'Admin created successfully',
      data: await this.adminService.create(createAdminDto),
    };
  }
  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 200, type: [AdminDto] })
  async findAll() {
    return {
      data: await this.adminService.list(),
    };
  }
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({ status: 200, type: AdminDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      data: await this.adminService.findById(id),
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
}
