import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { SWAGGER_EMAIL_EXAMPLE } from '../constants/swagger/email.example';
import { SWAGGER_PASSWORD_EXAMPLE } from '../constants/swagger/password.example';

export class RegisterUserDTO {
  @ApiProperty({
    description: 'User email',
    example: SWAGGER_EMAIL_EXAMPLE,
  })
  @IsString()
  @IsEmail({}, { message: 'Email is not valid' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description:
      'User password - Must be 5 characters at least with 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol',
    example: SWAGGER_PASSWORD_EXAMPLE,
  })
  @IsStrongPassword({
    minLength: 5,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;
}
