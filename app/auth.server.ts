import type { Team, User } from '@prisma/client';
import { authSession } from '~/cookies.server';
import { redirect } from 'react-router';
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
        github_username: profile._json.login,
        avatar_url: profile._json.avatar_url,
        email: profile._json.email,
      },
      where: {
        id: profile._json.id,
      },
      update: {
        name: profile._json.name,
        github_username: profile._json.login,
        avatar_url: profile._json.avatar_url,
        email: profile._json.email,
      },
    }),
);

authenticator.use(gitHubStrategy);

export const getUserOrRedirect = async (request: Request) =>
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

export const ensureIsTeamMember = async (request: Request, teamSlug: Team['slug']) => {
  const user = await getUserOrRedirect(request);
  const team = await prismaClient.team.findFirst({
    select: { slug: true },
    where: {
      slug: teamSlug.toLowerCase(),
      teamUsers: {
        some: {
          userId: user.id,
        },
      },
    },
  });
  if (!team) {
    throw redirect('/dashboard');
  }
};
