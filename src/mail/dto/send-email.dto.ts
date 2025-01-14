import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendBulkEmailDto {
  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Email content (HTML supported)' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
