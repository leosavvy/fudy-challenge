import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserPersistence } from '../../persistence/user/user.persistence';

@Module({
  providers: [UserService, UserPersistence, Logger],
  exports: [UserService],
})
export class UserModule {}
