import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserPersistence } from '../../persistence/user/user.persistence';
import { PrismaModule } from '../../persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserService, UserPersistence, Logger],
  exports: [UserService],
})
export class UserModule {}
