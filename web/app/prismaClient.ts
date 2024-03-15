import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { WebSocket } from 'undici';

neonConfig.webSocketConstructor = WebSocket;
const connectionString = `${process.env.DATABASE_URL}`;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var, @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let prisma: PrismaClient | undefined;
}

const getPrismaClient = () => {
  if (IS_PRODUCTION) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter, log: IS_PRODUCTION ? [] : ['query', 'info', 'warn', 'error'] });
  }
  return new PrismaClient({ log: ['query', 'info', 'warn', 'error'], datasourceUrl: connectionString });
};

export const prismaClient = IS_PRODUCTION ? getPrismaClient() : global.prisma || getPrismaClient();

if (!IS_PRODUCTION) {
  global.prisma = prismaClient;
}
