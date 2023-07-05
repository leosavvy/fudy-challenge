import { Module } from '@nestjs/common';
import { Prisma } from './prisma.service';

@Module({
  providers: [Prisma],
  exports: [Prisma],
})
export class PrismaModule {}
