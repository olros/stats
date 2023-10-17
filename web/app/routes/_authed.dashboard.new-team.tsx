import { Button, Card, FormControl, FormLabel, Input, Stack, Typography } from '@mui/joy';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { slugify } from '~/utils';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserOrRedirect(request);
  const formData = await request.formData();
  const name = formData.get('name') as string;
  try {
    const team = await prismaClient.team.create({
      data: {
        name,
        slug: slugify(name),
        teamUsers: {
          create: {
            userId: user.id,
          },
        },
      },
    });
    return redirect(`/dashboard/${team.slug}`);
  } catch (e) {
    console.error('[New Team]', e);
    if (e instanceof PrismaClientKnownRequestError) {
      return json({ errors: { name: 'This team name is already taken' } }, { status: 400 });
    }
  }
  return json({ errors: { name: 'Something went wrong' } }, { status: 400 });
};

export default function CreateTeam() {
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  return (
    <Card>
      <Typography gutterBottom level='h1'>
        Create team
      </Typography>
      <Stack component={Form} gap={1} method='post'>
        <FormControl id='name' required>
          <FormLabel id='name-label'>Team name</FormLabel>
          <Input disabled={state === 'submitting'} error={Boolean(actionData?.errors.name)} name='name' />
        </FormControl>
        <Stack direction='row' gap={1}>
          <Button loading={state === 'submitting'} sx={{ viewTransitionName: 'create-team' }} type='submit'>
            Save
          </Button>
          <Button component={Link} to='/dashboard' unstable_viewTransition variant='plain'>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
