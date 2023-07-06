import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { getUuid } from '../../common/utils/get-uuid';
import { UserPersistence } from '../persistence/user/user.persistence';
import { USER_ALREADY_EXISTS_ERROR_MESSAGE } from './constants/user-already-exists.error';
import { CreateUserDTO } from './dtos/register.dto';
import { LoginResponse } from 'src/common/types/login-response.payload';
import * as bcryptjs from 'bcryptjs';
import { JwtWrapperService } from '../jwt-wrapper/jwt-wrapper.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userPersistence: UserPersistence,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly logger: Logger,
  ) {}

  async findByEmail(email: User['email']): Promise<User | undefined> {
    return this.userPersistence.findUserByEmail(email);
  }

  async register(createUserDTO: CreateUserDTO): Promise<LoginResponse> {
    const existingUser = await this.userPersistence.findUserByEmail(createUserDTO.email);

    if (existingUser) {
      throw new BadRequestException(USER_ALREADY_EXISTS_ERROR_MESSAGE);
    }

    const createdUser = await this.userPersistence.createUser({
      ...createUserDTO,
      password: await bcryptjs.hash(createUserDTO.password, 15),
      uuid: getUuid(),
      createdAt: new Date(),
    });

    const { password, id, ...result } = createdUser;

    const token = this.jwtWrapperService.signToken({
      email: createdUser.email,
      uuid: createdUser.uuid,
    });

    return {
      access_token: token,
      ...result,
    };
  }
}
