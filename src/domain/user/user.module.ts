import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserPersistence } from '../persistence/user/user.persistence';
import { PrismaModule } from '../persistence/prisma/prisma.module';
import { JwtWrapperModule } from '../jwt-wrapper/jwt-wrapper.module';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule, JwtWrapperModule],
  providers: [UserService, UserPersistence, Logger],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
