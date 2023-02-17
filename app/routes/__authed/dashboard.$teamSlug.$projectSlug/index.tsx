import { Button, Card, Stack, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);

  const project = await prismaClient.project.findFirst({
    where: {
      slug: params.projectSlug.toLowerCase(),
      teamSlug: params.teamSlug.toLowerCase(),
    },
  });

  if (!project) {
    throw redirect(`/dashboard/${params.teamSlug}`);
  }

  return json({ project });
};

export default function ProjectDashboard() {
  const { project } = useLoaderData<typeof loader>();
  return <></>;
}
