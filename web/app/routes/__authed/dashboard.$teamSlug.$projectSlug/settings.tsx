import { Box, Button, Card, FormControl, FormHelperText, FormLabel, Input, Switch, Textarea, Typography } from '@mui/joy';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import { useIsClient } from 'usehooks-ts';

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
    const url = formData.get('url') as string;
    const allowed_hosts = formData.get('allowed_hosts') as string;
    const public_statistics = formData.get('public_statistics') === 'on';
    const track_page_visitors = formData.get('track_page_visitors') === 'on';
    try {
      const project = await prismaClient.project.update({
        data: {
          name,
          url,
          allowed_hosts,
          public_statistics,
          track_page_visitors,
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
          <FormLabel id='allowed_hosts-label'>Allowed hosts</FormLabel>
          <Textarea defaultValue={project.allowed_hosts} disabled={state === 'submitting'} minRows={2} name='allowed_hosts' placeholder='stats.olafros.com' />
          <FormHelperText>Separate multiple hosts with commas. Leave empty to allow all hosts</FormHelperText>
        </FormControl>
        <FormControl id='track_page_visitors' orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <Box>
            <FormLabel>Track unique page visitors</FormLabel>
            <FormHelperText sx={{ mt: 0, display: 'block' }}>
              Enable tracking unique page visitors by storing a hash consisting of each visitors IP-adress, user-agent and a random salt. Changing this will not
              affect data of eventual previously tracked unique users
            </FormHelperText>
          </Box>
          <Switch defaultChecked={project.track_page_visitors} slotProps={{ input: { name: 'track_page_visitors' } }} variant='solid' />
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
