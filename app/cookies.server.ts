import type { SessionIdStorageStrategy } from '@remix-run/node';
import { createCookieSessionStorage } from '@remix-run/node';
import { hoursToSeconds } from 'date-fns';

export const DEFAULT_COOKIE_OPTIONS: SessionIdStorageStrategy['cookie'] = {
  sameSite: 'lax',
  path: '/',
  httpOnly: true,
  secrets: ['infoscreen'],
  secure: process.env.NODE_ENV === 'production',
};

export const authSession = createCookieSessionStorage({
  cookie: {
    ...DEFAULT_COOKIE_OPTIONS,
    name: '_auth',
    maxAge: hoursToSeconds(24 * 30), // 1 month
  },
});
