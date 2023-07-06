import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import { getUuid } from '../../common/utils/get-uuid';
import { UserPersistence } from '../persistence/user/user.persistence';
import { USER_ALREADY_EXISTS_ERROR_MESSAGE } from './constants/user-already-exists.error';
import { CreateUserDTO } from './dtos/register.dto';

@Injectable()
export class UserService {
  constructor(private readonly userPersistence: UserPersistence) {}

  async findByEmail(email: User['email']): Promise<User | undefined> {
    return this.userPersistence.findUserByEmail(email);
  }

  async register(createUserDTO: CreateUserDTO): Promise<User['uuid']> {
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

    return createdUser.uuid;
  }
}
