import { Prisma } from '@prisma/client';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import { Card } from '~/components/ui/card';
import { Typography } from '~/components/typography';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  const team = await ensureIsTeamMember(request, params.teamSlug);
  return json({ team });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  if (request.method === 'PUT') {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    try {
      const team = await prismaClient.team.update({
        data: {
          name,
        },
        where: {
          slug: params.teamSlug.toLowerCase(),
        },
      });
      return redirect(`/dashboard/${team.slug}/settings`);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return json({ errors: { name: 'This team name is already taken' } }, { status: 400 });
      }
    }
  }
  if (request.method === 'DELETE') {
    await prismaClient.team.delete({
      where: {
        slug: params.teamSlug.toLowerCase(),
      },
    });
    return redirect(`/dashboard`);
  }
  return json({ errors: { name: 'Something went wrong' } }, { status: 400 });
};

export default function TeamSettings() {
  const { team } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();

  const [deleteName, setDeleteName] = useState('');

  return (
    <>
      <Card>
        <Form method='put'>
          <Typography variant='h3'>Edit</Typography>
          <Label htmlFor='name'>Team name</Label>
          <Input
            className='mb-4'
            required
            id='name'
            defaultValue={team.name}
            disabled={state === 'submitting'}
            error={Boolean(actionData?.errors.name)}
            name='name'
          />
          <Button disabled={state === 'submitting'} type='submit'>
            Save
          </Button>
        </Form>
      </Card>

      <Card className='border-red-500'>
        <Form method='delete'>
          <Typography className='text-red-500' variant='h3'>
            Delete team
          </Typography>
          <Typography className='select-none'>
            {`Deleting the team will delete all its projects and their data. This action cannot be undone. Type the "delete ${team.name}" to confirm.`}
          </Typography>
          <Input
            className='my-4'
            required
            autoComplete='off'
            disabled={state === 'submitting'}
            onChange={(e) => setDeleteName(e.target.value)}
            value={deleteName}
          />
          <Button variant='destructive' disabled={deleteName !== `delete ${team.name}` || state === 'submitting'} type='submit'>
            I understand the consequences, delete this team
          </Button>
        </Form>
      </Card>
    </>
  );
}
