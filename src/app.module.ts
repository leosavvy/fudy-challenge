import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './domain/auth/auth.module';
import { JwtAuthGuard } from './domain/auth/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './domain/user/user.module';
import { PrismaModule } from './domain/persistence/prisma/prisma.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    JwtModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    Logger,
  ],
})
export class AppModule {
  configure(): void {}
}
