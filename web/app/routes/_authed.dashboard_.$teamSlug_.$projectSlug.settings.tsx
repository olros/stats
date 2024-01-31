import { Box, Button, Card, FormControl, FormHelperText, FormLabel, Input, Switch, Textarea, Typography } from '@mui/joy';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { ConfirmDialog } from '~/components/ConfirmDialog';
import { useIsClient } from '~/hooks/useIsClient';
import { prismaClient } from '~/prismaClient';
import { useCallback, useState } from 'react';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  if (request.method === 'POST') {
    const formData = await request.formData();
    const deleteResource = formData.get('deleteResource');
    if (deleteResource === 'events') {
      await prismaClient.customEvent.deleteMany({
        where: {
          project: {
            slug: params.projectSlug.toLowerCase(),
            teamSlug: params.teamSlug.toLowerCase(),
          },
        },
      });
    }
    if (deleteResource === 'pageviews') {
      await prismaClient.pageViewNext.deleteMany({
        where: {
          project: {
            slug: params.projectSlug.toLowerCase(),
            teamSlug: params.teamSlug.toLowerCase(),
          },
        },
      });
    }
    return redirect(`/dashboard/${params.teamSlug}/${params.projectSlug}/settings`);
  }
  if (request.method === 'PUT') {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const url = formData.get('url') as string;
    const allowed_hosts = formData.get('allowed_hosts') as string;
    const public_statistics = formData.get('public_statistics') === 'on';
    try {
      const project = await prismaClient.project.update({
        data: {
          name,
          url,
          allowed_hosts,
          public_statistics,
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
        return json({ errors: { name: 'This team already contains a project with this name' } }, { status: 400 });
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
  return json({ errors: { name: 'Something went wrong' } }, { status: 400 });
};

export default function ProjectSettings() {
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  const submit = useSubmit();

  const deleteProjectEvents = useCallback(() => submit({ deleteResource: 'events' }, { method: 'POST', replace: true }), [submit]);
  const deleteProjectPageviews = useCallback(() => submit({ deleteResource: 'pageviews' }, { method: 'POST', replace: true }), [submit]);

  const [deleteName, setDeleteName] = useState('');

  const isClient = useIsClient();
  const publicStatsUrl = isClient ? `${location.origin}/public/${project.teamSlug}/${project.slug}` : '';

  return (
    <>
      <Card component={Form} method='put' sx={{ gap: 1 }}>
        <Typography level='h3'>Edit</Typography>
        <FormControl error={Boolean(actionData?.errors?.name)} id='name' required>
          <FormLabel id='name-label'>Project name</FormLabel>
          <Input defaultValue={project.name} disabled={state === 'submitting'} name='name' />
          {Boolean(actionData?.errors?.name) && <FormHelperText>{actionData?.errors?.name}</FormHelperText>}
        </FormControl>
        <FormControl id='url' required>
          <FormLabel id='url-label'>Website url</FormLabel>
          <Input defaultValue={project.url} disabled={state === 'submitting'} name='url' type='url' />
        </FormControl>
        <FormControl id='allowed_hosts'>
          <FormLabel id='allowed_hosts-label'>Allowed orgins</FormLabel>
          <Textarea defaultValue={project.allowed_hosts} disabled={state === 'submitting'} minRows={2} name='allowed_hosts' placeholder='stats.olafros.com' />
          <FormHelperText>
            Specify which origins that are allowed to track pageviews and events for this project. Separate multiple origins with commas. Leave empty to allow
            all orgins
          </FormHelperText>
        </FormControl>
        <FormControl id='public_statistics' orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <Box>
            <FormLabel>Public dashboard</FormLabel>
            <FormHelperText sx={{ mt: 0, display: 'block' }}>
              Make stats publicly available at{' '}
              <Box component='a' href={publicStatsUrl} sx={{ overflowWrap: 'anywhere', color: (theme) => theme.palette.text.primary }} target='_blank'>
                {publicStatsUrl}
              </Box>
            </FormHelperText>
          </Box>
          <Switch defaultChecked={project.public_statistics} slotProps={{ input: { name: 'public_statistics' } }} variant='solid' />
        </FormControl>
        <Button loading={state === 'submitting'} type='submit'>
          Save
        </Button>
      </Card>

      <Card color='danger' sx={{ gap: 1 }}>
        <Typography color='danger' level='h3'>
          Delete project-data
        </Typography>
        <ConfirmDialog
          description="All stored data about this project's pageviews will get permanently deleted"
          onConfirm={deleteProjectPageviews}
          title='Delete pageviews data'>
          Delete pageviews data
        </ConfirmDialog>
        <ConfirmDialog
          description="All stored data about this project's custom events will get permanently deleted"
          onConfirm={deleteProjectEvents}
          title='Delete custom events data'>
          Delete custom events data
        </ConfirmDialog>
      </Card>

      <Card color='danger' component={Form} method='delete' sx={{ gap: 1 }}>
        <Typography color='danger' level='h3'>
          Delete project
        </Typography>
        <Typography>{`Deleting the project will delete all its data. This action cannot be undone. Type "delete ${project.name}" to confirm.`}</Typography>
        <FormControl id='delete-name' required>
          <Input autoComplete='off' disabled={state === 'submitting'} onChange={(e) => setDeleteName(e.target.value)} value={deleteName} />
        </FormControl>
        <Button color='danger' disabled={deleteName !== `delete ${project.name}`} loading={state === 'submitting'} type='submit'>
          I understand the consequences, delete this project
        </Button>
      </Card>
    </>
  );
}
