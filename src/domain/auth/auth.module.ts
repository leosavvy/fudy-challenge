import { ConsoleLogger, Logger, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../auth/auth.controller';
import { JwtWrapperModule } from '../jwt-wrapper/jwt-wrapper.module';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, PassportModule, JwtWrapperModule, ConfigModule],
  providers: [AuthService, LocalStrategy, JwtStrategy, ConsoleLogger],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
