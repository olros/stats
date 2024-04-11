import type { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;

  // The stats-object that is placed on window when stats is
  // imported through `script.js`
  var __stats: {
    event: (name: string) => void;
    pageview: (data: { pathname: string; referrer: string | null }) => void;
  };
}
