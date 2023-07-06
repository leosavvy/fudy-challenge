import { Body, Controller, HttpException, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginResponse } from 'src/common/types/login-response.payload';
import { Public } from '../../common/decorators/public.decorator';
import { USER_ALREADY_EXISTS_ERROR_MESSAGE } from './constants/user-already-exists.error';
import { CreateUserDTO } from './dtos/register.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly logger: Logger) {}

  @ApiOperation({
    summary: 'Register a new user.',
  })
  @ApiResponse({
    status: 201,
    description: 'User Created',
  })
  @ApiResponse({
    status: 400,
    description: 'User already exists',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: USER_ALREADY_EXISTS_ERROR_MESSAGE,
          error: 'Bad Request',
        },
      },
    },
  })
  @Public()
  @Post('register')
  async register(@Body() dto: CreateUserDTO): Promise<LoginResponse> {
    try {
      return await this.userService.register(dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(error);
    }
  }
}
