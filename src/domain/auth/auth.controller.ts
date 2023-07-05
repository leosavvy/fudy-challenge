import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/domain/auth/auth.service';
import { Public } from 'src/domain/auth/decorators/public.decorator';
import { LoginDTO } from 'src/domain/auth/dtos/login.dto';
import { RegisterUserDTO } from 'src/domain/auth/dtos/register.dto';
import { LocalAuthGuard } from 'src/domain/auth/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly logger: Logger) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDTO) {
    return await this.authService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() dto: LoginDTO) {
    return await this.authService.login(dto.email);
  }

  // This endpoint is for debugging purposes only
  // to validate JWT tokens validation is working as expected
  @Get('validate')
  async validate() {
    return true;
  }
}
