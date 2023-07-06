import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { Prisma } from '../prisma/prisma.service';

@Injectable()
export class UserPersistence {
  constructor(private readonly prisma: Prisma, private readonly logger: Logger) {}

  async findUserByEmail(email: User['email']): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async createUser(userData: Omit<User, 'id' | 'updatedAt'>): Promise<User> {
    return await this.prisma.user.create({
      data: {
        ...userData,
      },
    });
  }
}
