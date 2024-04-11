import type { CustomEvent, PageViewNext } from '@prisma/client';

export type PageviewInput = Pick<PageViewNext, 'pathname'> & {
  referrer: string | null | undefined;
};

export type CustomEventInput = Pick<CustomEvent, 'name'>;
