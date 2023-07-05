import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDTO {
  @MinLength(5)
  @IsEmail({}, { message: 'Email is not valid' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  password: string;
}
