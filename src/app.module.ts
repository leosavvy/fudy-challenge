import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './domain/auth/auth.module';
import { JwtAuthGuard } from './domain/auth/guards/jwt-auth.guard';
import { PrismaModule } from './domain/persistence/prisma/prisma.module';
import { UserModule } from './domain/user/user.module';

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
  ],
})
export class AppModule {
  configure(): void {}
}
