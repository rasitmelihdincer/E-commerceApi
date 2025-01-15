import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { RefundService } from './refund.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { UpdateRefundStatusDto } from './dto/update-refund-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RefundRequestEntity } from './entities/refund-request.entity';
import { SessionType, RefundStatus } from '@prisma/client';

@ApiTags('refund')
@Controller('refund')
@UseGuards(AuthGuard)
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post()
  @ApiOperation({ summary: 'Create a refund request' })
  @ApiResponse({
    status: 201,
    description: 'The refund request has been created.',
    type: RefundRequestEntity,
  })
  create(
    @Body() createRefundRequestDto: CreateRefundRequestDto,
    @Request() req,
  ) {
    if (!req.session || !req.session.customerId) {
      throw new UnauthorizedException('User session not found');
    }
    return this.refundService.create(
      createRefundRequestDto,
      req.session.customerId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all refund requests' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RefundStatus,
  })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of refund requests',
    type: [RefundRequestEntity],
  })
  findAll(
    @Query('status') status?: string,
    @Query('customerId') customerId?: number,
    @Request() req?,
  ) {
    if (!req.session) {
      throw new UnauthorizedException('User session not found');
    }

    // Session tipine göre kontrol
    const isAdmin = req.session.type === SessionType.ADMIN;

    if (isAdmin) {
      if (status) {
        return this.refundService.findAllByStatus(status);
      }
      if (customerId) {
        return this.refundService.findByCustomerId(customerId);
      }
      return this.refundService.findAll();
    }

    // Müşteri sadece kendi taleplerini görebilir
    return this.refundService.findByCustomerId(req.session.customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a refund request by ID' })
  @ApiParam({ name: 'id', description: 'Refund request ID' })
  @ApiResponse({
    status: 200,
    description: 'The refund request details',
    type: RefundRequestEntity,
  })
  findOne(@Param('id') id: string, @Request() req) {
    if (!req.session) {
      throw new UnauthorizedException('User session not found');
    }

    const userInfo = {
      id: req.session.customerId,
      type: req.session.type,
    };
    return this.refundService.findOne(+id, userInfo);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update refund request status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Refund request ID' })
  @ApiBody({
    type: UpdateRefundStatusDto,
    examples: {
      approve: {
        value: { status: 'APPROVED' },
        description: 'Approve the refund request',
      },
      reject: {
        value: { status: 'REJECTED' },
        description: 'Reject the refund request',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The refund request has been updated',
    type: RefundRequestEntity,
  })
  update(
    @Param('id') id: string,
    @Body() updateRefundStatusDto: UpdateRefundStatusDto,
  ) {
    return this.refundService.updateStatus(+id, updateRefundStatusDto);
  }
}
