import { Button, Card, FormControl, FormLabel, Input, Stack, Typography } from '@mui/joy';
import { Prisma } from '@prisma/client';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import type { ActionFunctionArgs } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { redirect, slugify } from '~/utils.server';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const action = async ({ request, response }: ActionFunctionArgs) => {
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
    return redirect(response, `/dashboard/${team.slug}`);
  } catch (e) {
    console.error('[New Team]', e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      response!.status = 400;
      return { errors: { name: 'This team name is already taken' } };
    }
  }
  response!.status = 400;
  return { errors: { name: 'Something went wrong' } };
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
