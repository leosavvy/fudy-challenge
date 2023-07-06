import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { SWAGGER_EMAIL_EXAMPLE } from '../../../common/swagger/constants/email.example';
import { SWAGGER_PASSWORD_EXAMPLE } from '../../../common/swagger/constants/password.example';

export class LoginDTO {
  @ApiProperty({
    description: 'User email',
    example: SWAGGER_EMAIL_EXAMPLE,
  })
  @MinLength(5)
  @IsEmail({}, { message: 'Email is not valid' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'User password',
    example: SWAGGER_PASSWORD_EXAMPLE,
  })
  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  password: string;
}
