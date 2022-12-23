import type { User } from '@prisma/client';
import { authSession } from '~/cookies.server';
import { Authenticator } from 'remix-auth';
import { GitHubStrategy } from 'remix-auth-github';
import invariant from 'tiny-invariant';

import { prismaClient } from './prismaClient';

export const authenticator = new Authenticator<User>(authSession);

invariant(process.env.GITHUB_CLIENT_ID, 'Expected GITHUB_CLIENT_ID to be set in .env');
invariant(process.env.GITHUB_CLIENT_SECRET, 'Expected GITHUB_CLIENT_SECRET to be set in .env');

const gitHubStrategy = new GitHubStrategy(
  {
    scope: ['read:user'],
    userAgent: 'stats.olafros.com',
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' ? 'https://stats.olafros.com/auth/github/callback' : 'http://localhost:3000/auth/github/callback',
  },
  async ({ profile }) =>
    await prismaClient.user.upsert({
      create: {
        id: profile._json.id,
        name: profile._json.name,
        avatar: profile._json.avatar_url,
        email: profile._json.email,
      },
      where: {
        id: profile._json.id,
      },
      update: {
        name: profile._json.name,
        avatar: profile._json.avatar_url,
        email: profile._json.email,
      },
    }),
);

authenticator.use(gitHubStrategy);
