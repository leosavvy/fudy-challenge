import { ConsoleLogger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserPersistence } from '../persistence/user/user.persistence';
import { PrismaModule } from '../persistence/prisma/prisma.module';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  providers: [UserService, UserPersistence, ConsoleLogger],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
