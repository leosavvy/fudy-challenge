import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from 'src/domain/auth/auth.controller';
import { MailingModule } from '../mailing/mailing.module';

@Module({
  imports: [
    UserModule,
    MailingModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('SECRET_KEY') || process.env.SECRET_KEY,
          signOptions: { expiresIn: '10d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, Logger],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
