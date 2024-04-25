import type { Prisma, Project } from '@prisma/client';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prismaClient } from '~/prismaClient';
import { getProjectAndCheckPermissions } from '~/utils_api.server';
import { getCustomEventsUsage } from '~/utils_usage.server';
import { getHours } from 'date-fns';
import invariant from 'tiny-invariant';

import type { CustomEventInput } from '~/types';

const parseCustomEventInput = async (request: Request, response: ActionFunctionArgs['response']): Promise<CustomEventInput> => {
  const data = (await request.json()) as CustomEventInput;
  if (!data.name) {
    response!.status = 400;
    throw { errors: { name: `Name isn't defined` } };
  }

  return data;
};

const trackCustomEvent = async (request: Request, response: ActionFunctionArgs['response'], project: Project) => {
  const { customEvents } = await getCustomEventsUsage(project.teamSlug);

  if (!customEvents.withinLimit) {
    return;
  }

  const data = await parseCustomEventInput(request, response);

  const date = new Date();
  const hour = getHours(date);

  const customEventCompoundUnique: Prisma.CustomEventProjectIdDateHourNameCompoundUniqueInput = {
    date,
    hour,
    projectId: project.id,
    name: data.name,
  };

  await prismaClient.customEvent.upsert({
    create: {
      ...customEventCompoundUnique,
      count: 1,
    },
    where: {
      projectId_date_hour_name: customEventCompoundUnique,
    },
    update: {
      count: { increment: 1 },
    },
  });
};

export const action = async ({ request, params, response }: ActionFunctionArgs) => {
  try {
    invariant(params.teamSlug, `Expected params.teamSlug`);
    invariant(params.projectSlug, `Expected params.projectSlug`);

    const { project } = await getProjectAndCheckPermissions(request, params.teamSlug, params.projectSlug);

    await trackCustomEvent(request, response, project);

    return { ok: true };
  } catch (e) {
    console.error('[API-Internal - Event]', e);
    response!.status = 400;
    return { ok: false };
  }
};
