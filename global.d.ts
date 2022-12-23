import type { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;
}
