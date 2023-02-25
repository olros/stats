import create_slug from 'slugify';

import { DeviceType } from './types';

export const slugify = (string: string) =>
  create_slug(string, {
    lower: true,
    strict: true,
    trim: true,
  });

export const screenWidthToDeviceType = (screenWidth: number): DeviceType => {
  if (screenWidth > 1000) {
    return DeviceType.DESKTOP;
  }
  if (screenWidth > 600) {
    return DeviceType.TABLET;
  }
  return DeviceType.MOBILE;
};
