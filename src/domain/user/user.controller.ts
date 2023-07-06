import { Body, ConsoleLogger, Controller, HttpException, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { USER_ALREADY_EXISTS_ERROR_MESSAGE } from './constants/user-already-exists.error';
import { CreateUserDTO } from './dtos/register.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly logger: ConsoleLogger) {
    this.logger.setContext(UserController.name);
  }

  @ApiOperation({
    summary: 'Register a new user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Returns created user uuid',
    content: {
      'application/json': {
        example: {
          uuid: 'b3d7f1e0-0f1a-4e1a-8f1a-0f1a0f1a0f1a',
        },
      },
    },
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
  async register(@Body() dto: CreateUserDTO): Promise<User['uuid']> {
    try {
      return await this.userService.register(dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `There was an error when trying to register an user: ${JSON.stringify(error)}`,
      );
    }
  }
}
