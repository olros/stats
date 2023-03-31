import { PrismaClient } from '@prisma/client/edge';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var, @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let prisma: PrismaClient | undefined;
}

export const prismaClient =
  process.env.NODE_ENV !== 'production' ? global.prisma || new PrismaClient({ log: ['query'] }) : new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient;
}
