import { PrismaClient, User } from '@prisma/client';
import { getUuid } from 'src/common/utils/get-uuid';

const baseUser: Omit<User, 'id' | 'updatedAt' | 'subscriptionId'> = {
  email: 'leonardosolorzano16@gmail.com',
  password: '$2a$15$aQPQvpbwKvW7z.lzzvTPWe8lxGMH7gayjc3KFPnHaVRUt3TcAEQW2',
  createdAt: new Date(),
  uuid: getUuid(),
};

export async function userSeed(prisma: PrismaClient) {
  await prisma.user.upsert({
    where: {
      email: baseUser.email,
    },
    update: { ...baseUser },
    create: { ...baseUser },
  });
}
