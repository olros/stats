import { Prisma } from '@prisma/client';
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { ConfirmDialog } from '~/components/ConfirmDialog';
import { useIsClient } from '~/hooks/useIsClient';
import { prismaClient } from '~/prismaClient';
import { useCallback, useState } from 'react';
import invariant from 'tiny-invariant';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Typography } from '~/components/typography';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Checkbox } from '~/components/ui/checkbox';

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
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
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
      <Card>
        <Form method='put'>
          <Typography variant='h3'>Edit</Typography>
          <Label htmlFor='name'>Project name</Label>
          <Input id='name' error={Boolean(actionData?.errors?.name)} required defaultValue={project.name} disabled={state === 'submitting'} name='name' />
          {Boolean(actionData?.errors?.name) && (
            <Typography className='mt-1' variant='small'>
              {actionData?.errors?.name}
            </Typography>
          )}
          <Label htmlFor='url'>Website url</Label>
          <Input required id='url' defaultValue={project.url} disabled={state === 'submitting'} name='url' type='url' />
          <Label htmlFor='allowed_hosts'>Allowed orgins</Label>
          <Textarea
            id='allowed_hosts'
            defaultValue={project.allowed_hosts}
            disabled={state === 'submitting'}
            name='allowed_hosts'
            placeholder='stats.olafros.com'
          />
          <Typography className='mt-1' variant='muted'>
            Specify which origins that are allowed to track pageviews and events for this project. Separate multiple origins with commas. Leave empty to allow
            all orgins
          </Typography>
          <div className='items-top flex space-x-2 my-4'>
            <Checkbox defaultChecked={project.public_statistics} name='public_statistics' id='public_statistics' />
            <div className='grid gap-1.5 leading-none'>
              <Label htmlFor='public_statistics'>Public dashboard</Label>
              <Typography variant='muted'>
                Make stats publicly available at{' '}
                <a href={publicStatsUrl} className='break-words underline' target='_blank'>
                  {publicStatsUrl}
                </a>
              </Typography>
            </div>
          </div>
          <Button disabled={state === 'submitting'} type='submit'>
            Save
          </Button>
        </Form>
      </Card>

      <Card className='border-red-500 flex flex-col gap-2'>
        <Typography className='text-red-500' variant='h3'>
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

      <Card className='border-red-500'>
        <Form method='delete'>
          <Typography className='text-red-500' variant='h3'>
            Delete project
          </Typography>
          <Typography className='select-none'>{`Deleting the project will delete all its data. This action cannot be undone. Type "delete ${project.name}" to confirm.`}</Typography>
          <Input
            className='my-4'
            autoComplete='off'
            required
            disabled={state === 'submitting'}
            onChange={(e) => setDeleteName(e.target.value)}
            value={deleteName}
          />
          <Button color='danger' disabled={deleteName !== `delete ${project.name}` || state === 'submitting'} type='submit'>
            I understand the consequences, delete this project
          </Button>
        </Form>
      </Card>
    </>
  );
}
