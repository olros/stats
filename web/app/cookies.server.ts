import type { SessionIdStorageStrategy } from '@remix-run/node';
import { createCookieSessionStorage } from '@remix-run/node';
import { hoursToSeconds, weeksToDays } from 'date-fns';
import invariant from 'tiny-invariant';

invariant(process.env.GITHUB_CLIENT_SECRET, 'Expected GITHUB_CLIENT_SECRET to be set in .env');

export const DEFAULT_COOKIE_OPTIONS: SessionIdStorageStrategy['cookie'] = {
  sameSite: 'lax',
  path: '/',
  httpOnly: true,
  secrets: [process.env.GITHUB_CLIENT_SECRET],
  secure: process.env.NODE_ENV === 'production',
};

export const authSession = createCookieSessionStorage({
  cookie: {
    ...DEFAULT_COOKIE_OPTIONS,
    name: '_stats_auth',
    maxAge: hoursToSeconds(24 * weeksToDays(1)), // 1 week
  },
});
