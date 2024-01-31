import type { CustomEvent, PageViewNext } from '@prisma/client';

export type PageviewInput = Pick<PageViewNext, 'pathname'> & {
  screen_width: number | null | undefined;
  referrer: string | null | undefined;
};

export type CustomEventInput = Pick<CustomEvent, 'name'>;
