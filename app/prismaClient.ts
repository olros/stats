import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var, @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let prisma: PrismaClient | undefined;
}

export const prismaClient = global.prisma || new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') global.prisma = prismaClient;
