import type { Prisma, Project } from '@prisma/client';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prismaClient } from '~/prismaClient';
import { getProjectAndCheckPermissions } from '~/utils_api.server';
import { getCustomEventsUsage } from '~/utils_usage.server';
import { getHours } from 'date-fns';
import invariant from 'tiny-invariant';

import type { CustomEventInput } from '~/types';

const parseCustomEventInput = async (request: Request): Promise<CustomEventInput> => {
  const data = (await request.json()) as CustomEventInput;
  if (!data.name) {
    throw json({ errors: { name: `Name isn't defined` } }, { status: 400 });
  }

  return data;
};

const trackCustomEvent = async (request: Request, project: Project) => {
  const { customEvents } = await getCustomEventsUsage(project.teamSlug);

  if (!customEvents.withinLimit) {
    return;
  }

  const data = await parseCustomEventInput(request);

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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    invariant(params.teamSlug, `Expected params.teamSlug`);
    invariant(params.projectSlug, `Expected params.projectSlug`);

    const { project } = await getProjectAndCheckPermissions(request, params.teamSlug, params.projectSlug);

    await trackCustomEvent(request, project);

    return json({ ok: true }, { status: 202 });
  } catch (e) {
    console.error('[API-Internal - Event]', e);
    return json({ ok: false }, { status: 400 });
  }
};
