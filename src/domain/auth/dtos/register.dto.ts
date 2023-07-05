import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class RegisterUserDTO {
  @IsString()
  @IsEmail({}, { message: 'Email is not valid' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsStrongPassword({
    minLength: 5,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 0,
    minUppercase: 1,
  })
  password: string;
}
