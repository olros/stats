import type { Team } from '@prisma/client';

import { prismaClient } from './prismaClient';

export type Usage = {
  count: number;
  limit: number;
  withinLimit: boolean;
};

export type TeamUsage = {
  pageViewsNext: Usage;
  customEvents: Usage;
};

export const USAGE_LIMITS: Record<keyof TeamUsage, number> = {
  customEvents: 500_000,
  pageViewsNext: 20_000_000,
};

export const getPageViewsNextUsage = async (teamSlug: Team['slug']): Promise<Pick<TeamUsage, 'pageViewsNext'>> => {
  const count = await prismaClient.pageViewNext.count({
    where: { project: { teamSlug } },
  });
  const limit = USAGE_LIMITS['pageViewsNext'];
  const withinLimit = count < limit;

  return { pageViewsNext: { count, limit, withinLimit } };
};

export const getCustomEventsUsage = async (teamSlug: Team['slug']): Promise<Pick<TeamUsage, 'customEvents'>> => {
  const count = await prismaClient.customEvent.count({
    where: { project: { teamSlug } },
  });
  const limit = USAGE_LIMITS['customEvents'];
  const withinLimit = count < limit;

  return { customEvents: { count, limit, withinLimit } };
};

export const getTeamUsage = async (teamSlug: Team['slug']): Promise<TeamUsage> => {
  const [pageViewsNext, customEvents] = await Promise.all([getPageViewsNextUsage(teamSlug), getCustomEventsUsage(teamSlug)]);

  return { ...customEvents, ...pageViewsNext };
};
