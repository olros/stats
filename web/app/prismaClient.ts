import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { WebSocket } from 'undici';

dotenv.config();
neonConfig.webSocketConstructor = WebSocket;
const connectionString = `${process.env.DATABASE_URL}`;

const IS_PRODUCTION = process.env.NODE_ENV !== 'production';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var, @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let prisma: PrismaClient | undefined;
}

const getPrismaClient = () => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter, log: IS_PRODUCTION ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'] });
};

export const prismaClient = IS_PRODUCTION ? getPrismaClient() : global.prisma || getPrismaClient();

if (!IS_PRODUCTION) {
  global.prisma = prismaClient;
}
