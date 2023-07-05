import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Sql } from '@prisma/client/runtime';

@Injectable()
export class Prisma extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<boolean> {
    await this.$connect();
    return true;
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
