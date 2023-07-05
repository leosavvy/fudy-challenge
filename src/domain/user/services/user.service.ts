import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { getUuid } from 'src/common/utils/get-uuid';
import { UserPersistence } from 'src/persistence/user/user.persistence';

@Injectable()
export class UserService {
  constructor(private readonly userPersistence: UserPersistence, private readonly logger: Logger) {}

  async findByEmail(email: User['email']): Promise<User | undefined> {
    return this.userPersistence.findUserByEmail(email);
  }

  async register(
    createUserDTO: Pick<User, 'email' | 'password'>,
  ): Promise<Omit<User, 'password' | 'id'> | undefined> {
    const existingUser = await this.userPersistence.findUserByEmail(createUserDTO.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.userPersistence.createUser({
      ...createUserDTO,
      uuid: getUuid(),
      createdAt: new Date(),
    });

    const { password, id, ...result } = user;

    return result;
  }
}
