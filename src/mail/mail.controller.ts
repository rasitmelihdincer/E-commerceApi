import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendBulkEmailDto } from './dto/send-email.dto';
import { EventPattern } from '@nestjs/microservices';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send custom email to specific address' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendCustomEmail(
    @Body() body: { email: string; subject: string; content: string },
  ) {
    await this.mailService.sendCustomEmail(
      body.email,
      body.subject,
      body.content,
    );
    return {
      success: true,
      message: 'Email request received',
    };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send email to all customers' })
  @ApiResponse({ status: 200, description: 'Bulk email sending started' })
  async sendBulkEmail(@Body() body: SendBulkEmailDto) {
    const result = await this.mailService.sendBulkEmail(
      body.subject,
      body.content,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all email history' })
  @ApiResponse({ status: 200, description: 'List of all sent emails' })
  async getAllEmails() {
    return this.mailService.getEmailHistory();
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get email history for specific customer' })
  @ApiResponse({ status: 200, description: 'List of customer specific emails' })
  async getCustomerEmails(
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.mailService.getEmailHistory(customerId);
  }

  @EventPattern('send_custom_email')
  async handleCustomEmail(data: {
    email: string;
    subject: string;
    content: string;
  }) {
    return this.mailService.handleCustomEmail(data);
  }

  @EventPattern('send_order_confirmation')
  async handleOrderConfirmation(data: {
    email: string;
    subject: string;
    content: string;
    orderDetails: any;
  }) {
    return this.mailService.handleOrderConfirmationEmail(data);
  }

  @EventPattern('send_payment_confirmation')
  async handlePaymentConfirmation(data: {
    email: string;
    subject: string;
    content: string;
    paymentDetails: any;
  }) {
    return this.mailService.handlePaymentConfirmationEmail(data);
  }

  @EventPattern('send_refund_confirmation')
  async handleRefundConfirmation(data: {
    email: string;
    subject: string;
    content: string;
    refundDetails: any;
  }) {
    return this.mailService.handleRefundConfirmationEmail(data);
  }

  @EventPattern('send_bulk_email')
  async handleBulkEmail(data: {
    email: string;
    subject: string;
    content: string;
    customerId: number;
  }) {
    return this.mailService.handleBulkEmail(data);
  }
}
