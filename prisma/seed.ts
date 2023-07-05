import { PrismaClient } from '@prisma/client';
import { userSeed } from './seeds/user.seed';
const prisma = new PrismaClient();

const seeds: Array<CallableFunction> = [];

async function main() {
  for (const seed of seeds) {
    console.log(seed);
    await seed(prisma)
      .catch((e) => {
        console.error(e);
        process.exit(1);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
