import { ApiProperty } from '@nestjs/swagger';

export class AdminDto {
  hashedPassword(password: string, hashedPassword: any) {
    throw new Error('Method not implemented.');
  }
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
