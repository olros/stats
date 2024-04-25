import type { Team, User } from '@prisma/client';
import { authSession } from '~/cookies.server';
import { differenceInSeconds, minutesToSeconds } from 'date-fns';
import { redirect } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { GitHubStrategy } from 'remix-auth-github';
import slugify from 'slugify';
import invariant from 'tiny-invariant';

import { prismaClient } from './prismaClient';

export const authenticator = new Authenticator<User>(authSession);

invariant(process.env.GITHUB_CLIENT_ID, 'Expected GITHUB_CLIENT_ID to be set in .env');
invariant(process.env.GITHUB_CLIENT_SECRET, 'Expected GITHUB_CLIENT_SECRET to be set in .env');

const gitHubStrategy = new GitHubStrategy(
  {
    scope: ['read:user', 'user:email'],
    userAgent: 'stats.olafros.com',
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' ? 'https://stats.olafros.com/auth/github/callback' : 'http://localhost:3000/auth/github/callback',
  },
  async ({ profile }) => {
    const fields: Omit<User, 'id' | 'createdAt'> = {
      name: profile.name.givenName || profile.displayName,
      github_username: profile.displayName,
      avatar_url: profile.photos[0]?.value || '',
      email: profile.emails[0]?.value || '',
    };
    console.info('[GitHubStrategy-login]', { profile, fields });
    const user = await prismaClient.user
      .upsert({
        create: {
          id: profile.id,
          ...fields,
        },
        where: {
          id: profile.id,
        },
        update: fields,
      })
      .catch((error) => {
        console.error('[GitHubStrategy-error]', error);
        throw error;
      });
    try {
      const isNewUser = differenceInSeconds(new Date(), user.createdAt) < minutesToSeconds(2);
      if (isNewUser) {
        await prismaClient.team.create({
          data: {
            name: `${user.github_username}`,
            slug: slugify(`${user.github_username}`),
            teamUsers: {
              create: {
                userId: user.id,
              },
            },
          },
        });
      }
    } catch {
      console.warn("There already exists a team with the same name as the user's github username");
    }
    return user;
  },
);

authenticator.use(gitHubStrategy);

export const getUserOrRedirect = async (request: Request) =>
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/',
  });

export const ensureIsTeamMember = async (request: Request, teamSlug: Team['slug']) => {
  const user = await getUserOrRedirect(request);
  const team = await prismaClient.team.findFirst({
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
  return team;
};
