import { Logger, Module } from '@nestjs/common';
import { UserPersistence } from 'src/persistence/user/user.persistence';
import { UserService } from './services/user.service';

@Module({
  providers: [UserService, UserPersistence, Logger],
  exports: [UserService],
})
export class UserModule {}
