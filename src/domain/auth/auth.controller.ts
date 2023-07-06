import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { SWAGGER_EMAIL_EXAMPLE } from './constants/swagger/email.example';
import { UserDecorator } from './decorators/user.decorator';
import { LoginResponse } from './types/user-response.payload';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RegisterUserDTO } from './dtos/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDTO } from './dtos/login.dto';
import { getUuid } from '../../common/utils/get-uuid';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly logger: Logger) {}

  @ApiOperation({
    summary: 'Register a new user.',
  })
  @ApiResponse({
    status: 201,
    description: 'User Created',
    content: {
      'application/json': {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
          email: SWAGGER_EMAIL_EXAMPLE,
          uuid: getUuid(),
          createdAt: new Date().toISOString(),
          updatedAt: `${new Date().toISOString()} | null`,
        },
      },
    },
  })
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDTO): Promise<LoginResponse> {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(error);
    }
  }

  @ApiOperation({
    summary: 'Login with email and password, if there is a match, return a JWT token.',
  })
  @ApiResponse({
    status: 201,
    description: 'User found.',
    content: {
      'application/json': {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid password',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Invalid password',
          error: 'Unauthorized',
        },
      },
    },
  })
  @HttpCode(200)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() dto: LoginDTO): Promise<LoginResponse['access_token']> {
    try {
      ('asdasd');
      const { access_token } = await this.authService.login(dto.email);

      return access_token;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(error);
    }
  }

  @ApiOperation({
    summary: 'Return user information based on the JWT token provided in the Authorization header',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User information',
    content: {
      'application/json': {
        example: {
          uuid: '24556daa-5f8e-4f6a-9cff-209dcaeb3128',
          email: 'jack.sparrow@captain.pearl',
          createdAt: '2023-07-05T15:28:37.810Z',
          updatedAt: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized response due to invalid JWT token',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @Get('me')
  @HttpCode(200)
  async me(@UserDecorator() user: User) {
    const { id, password, ...rest } = user;

    return rest;
  }
}
