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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { SendBulkEmailDto } from './dto/send-email.dto';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  async sendTestEmail() {
    await this.mailService.sendTestEmail();
    return {
      success: true,
      message: 'Test email sent successfully',
    };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send email to all customers' })
  @ApiResponse({ status: 200, description: 'Bulk email sending results' })
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
}
