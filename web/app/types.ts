import type { PageView } from '@prisma/client';

export enum DeviceType {
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
}

export type PageviewInput = Pick<PageView, 'pathname'> & {
  screen_width: number | null | undefined;
};
