import { Body, Controller, Get, HttpCode, Logger, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { AuthService } from 'src/domain/auth/auth.service';
import { Public } from 'src/domain/auth/decorators/public.decorator';
import { LoginDTO } from 'src/domain/auth/dtos/login.dto';
import { RegisterUserDTO } from 'src/domain/auth/dtos/register.dto';
import { LocalAuthGuard } from 'src/domain/auth/guards/local-auth.guard';
import { UserDecorator } from './decorators/user.decorator';
import { User } from '@prisma/client';
import { LoginResponse } from './types/user-response.payload';
import { SWAGGER_EMAIL_EXAMPLE } from './constants/swagger/email.example';
import { getUuid } from 'src/common/utils/get-uuid';

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
      this.logger.error(error);
      throw new Error('There was an error registering the user');
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
      const { access_token } = await this.authService.login(dto.email);

      return access_token;
    } catch (error) {
      this.logger.error(error);
      throw new Error('There was an error during login');
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

  // This endpoint is for debugging purposes only
  // to validate JWT tokens validation is working as expected
  @Get('validate')
  async validate() {
    return true;
  }
}
