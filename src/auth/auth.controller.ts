import { Body, Controller, Post, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionType } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('customer/login')
  @ApiOperation({ summary: 'Customer login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async customerLogin(@Body() loginDto: LoginDto) {
    return this.authService.customerLogin(loginDto);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @Post('customer/logout')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Customer logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async customerLogout(@Headers('authorization') auth: string) {
    const token = auth.replace('Bearer ', '');
    return this.authService.logout(token, SessionType.CUSTOMER);
  }
  @Post('admin/logout')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Admin logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async adminLogout(@Headers('authorization') auth: string) {
    const token = auth.replace('Bearer ', '');
    return this.authService.logout(token, SessionType.ADMIN);
  }
}
