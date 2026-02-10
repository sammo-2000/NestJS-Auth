import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @ApiProperty({
    example: 'secret123',
    description: 'User password (minimum 5 characters)',
    minLength: 5,
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(5, { message: 'Password must be at least 5 characters long' })
  password: string;
}
