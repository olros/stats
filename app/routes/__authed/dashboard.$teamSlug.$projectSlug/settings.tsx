import { Button, Card, Stack, TextField, Typography } from '@mui/joy';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation, useParams } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { slugify } from '~/utils';
import { useState } from 'react';
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

export const action = async ({ request, params }: ActionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  if (request.method === 'PUT') {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    try {
      const project = await prismaClient.project.update({
        data: {
          name,
          slug: slugify(name),
        },
        where: {
          teamSlug_slug: {
            slug: params.projectSlug.toLowerCase(),
            teamSlug: params.teamSlug.toLowerCase(),
          },
        },
      });
      return redirect(`/dashboard/${params.teamSlug}/${project.slug}/settings`);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        return json({ errors: { name: 'This team already contains a project with this name' } });
      }
    }
  }
  if (request.method === 'DELETE') {
    await prismaClient.project.delete({
      where: {
        teamSlug_slug: {
          slug: params.projectSlug.toLowerCase(),
          teamSlug: params.teamSlug.toLowerCase(),
        },
      },
    });
    return redirect(`/dashboard/${params.teamSlug}`);
  }
  return json({ errors: { name: 'Something went wrong' } });
};

export default function ProjectSettings() {
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  const { teamSlug } = useParams();

  const [deleteName, setDeleteName] = useState('');

  return (
    <>
      <Stack component={Card} direction={{ sm: 'row' }} gap={1} justifyContent='space-between' sx={{ alignItems: 'center' }}>
        <Typography level='h1'>Settings</Typography>
        <Button component={Link} to={`/dashboard/${teamSlug}/${project.slug}`} variant='outlined'>
          Back
        </Button>
      </Stack>

      <Card component={Form} method='put' sx={{ gap: 1 }}>
        <Typography level='h3'>Edit</Typography>
        <TextField
          defaultValue={project.name}
          disabled={state === 'submitting'}
          error={Boolean(actionData?.errors.name)}
          helperText={actionData?.errors.name}
          id='name'
          label='Project name'
          name='name'
          required
        />
        <TextField defaultValue={project.url} disabled={state === 'submitting'} id='url' label='Website url' name='url' required type='url' />
        <Button loading={state === 'submitting'} type='submit'>
          Save
        </Button>
      </Card>

      <Card color='danger' component={Form} method='delete' sx={{ gap: 1 }}>
        <Typography color='danger' level='h3'>
          Delete project
        </Typography>
        <Typography>Deleting the project will delete all its data. This action cannot be undone. Type the name of the project to confirm.</Typography>
        <TextField
          autoComplete='off'
          disabled={state === 'submitting'}
          id='delete-name'
          label={`Please type "${project.name}" to confirm`}
          onChange={(e) => setDeleteName(e.target.value)}
          required
          value={deleteName}
        />
        <Button color='danger' disabled={deleteName !== project.name} loading={state === 'submitting'} type='submit'>
          I understand the consequences, delete this project
        </Button>
      </Card>
    </>
  );
}
