import {
  Body,
  ConsoleLogger,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { UserDecorator } from '../../common/decorators/user.decorator';
import { LoginResponse } from '../../common/types/login-response.payload';
import { AuthService } from './auth.service';
import { LoginDTO } from './dtos/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly logger: ConsoleLogger) {
    this.logger.setContext(AuthController.name);
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
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `There was an error when trying to log in an user: ${JSON.stringify(error)}`,
      );
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
