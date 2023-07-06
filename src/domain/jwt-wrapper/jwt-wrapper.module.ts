import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtWrapperService } from './jwt-wrapper.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow<string>('SECRET_KEY'),
          signOptions: { expiresIn: configService.getOrThrow<string>('TOKEN_EXPIRATION_TIME') },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtWrapperService],
  exports: [JwtWrapperService],
})
export class JwtWrapperModule {}
