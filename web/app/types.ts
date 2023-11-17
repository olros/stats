import type { CustomEvent, PageView } from '@prisma/client';

export enum DeviceType {
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
}

export type PageviewInput = Pick<PageView, 'pathname'> & {
  screen_width: number | null | undefined;
  referrer: string | null | undefined;
};

export type CustomEventInput = Pick<CustomEvent, 'name'>;
