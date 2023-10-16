import { Button, Card, FormControl, FormLabel, Input, Typography } from '@mui/joy';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { json } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { useState } from 'react';
import invariant from 'tiny-invariant';

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
      if (e instanceof PrismaClientKnownRequestError) {
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
      <Card component={Form} method='put' sx={{ gap: 1 }}>
        <Typography level='h3'>Edit</Typography>
        <FormControl id='name' required>
          <FormLabel id='name-label'>Team name</FormLabel>
          <Input defaultValue={team.name} disabled={state === 'submitting'} error={Boolean(actionData?.errors.name)} name='name' />
        </FormControl>
        <Button loading={state === 'submitting'} type='submit'>
          Save
        </Button>
      </Card>

      <Card color='danger' component={Form} method='delete' sx={{ gap: 1 }}>
        <Typography color='danger' level='h3'>
          Delete team
        </Typography>
        <Typography>
          {`Deleting the team will delete all its projects and their data. This action cannot be undone. Type the "delete ${team.name}" to confirm.`}
        </Typography>
        <FormControl id='delete-name' required>
          <Input autoComplete='off' disabled={state === 'submitting'} onChange={(e) => setDeleteName(e.target.value)} value={deleteName} />
        </FormControl>
        <Button color='danger' disabled={deleteName !== `delete ${team.name}`} loading={state === 'submitting'} type='submit'>
          I understand the consequences, delete this team
        </Button>
      </Card>
    </>
  );
}
