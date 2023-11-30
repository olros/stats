import type { Team } from '@prisma/client';

import { prismaClient } from './prismaClient';

export type Usage = {
  count: number;
  limit: number;
  withinLimit: boolean;
};

export type TeamUsage = {
  pageViews: Usage;
  pageVisitors: Usage;
  pageViewsNext: Usage;
  customEvents: Usage;
};

export const USAGE_LIMITS: Record<keyof TeamUsage, number> = {
  customEvents: 500_000,
  pageViewsNext: 1_000_000,
  pageViews: 1_000_000,
  pageVisitors: 1_000_000,
};

export const getPageViewsUsage = async (teamSlug: Team['slug']): Promise<Pick<TeamUsage, 'pageViews'>> => {
  const count = await prismaClient.pageView.count({
    where: { project: { teamSlug } },
  });
  const limit = USAGE_LIMITS['pageViews'];
  const withinLimit = count < limit;

  return { pageViews: { count, limit, withinLimit } };
};

export const getPageVisitorsUsage = async (teamSlug: Team['slug']): Promise<Pick<TeamUsage, 'pageVisitors'>> => {
  const count = await prismaClient.pageVisitor.count({
    where: { project: { teamSlug } },
  });
  const limit = USAGE_LIMITS['pageVisitors'];
  const withinLimit = count < limit;

  return { pageVisitors: { count, limit, withinLimit } };
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
  const [pageViews, pageVisitors, pageViewsNext, customEvents] = await Promise.all([
    getPageViewsUsage(teamSlug),
    getPageVisitorsUsage(teamSlug),
    getPageViewsNextUsage(teamSlug),
    getCustomEventsUsage(teamSlug),
  ]);

  return { ...pageViews, ...customEvents, ...pageViewsNext, ...pageVisitors };
};
