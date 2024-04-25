import { Button, Card, FormControl, FormLabel, Input, Stack, Typography } from '@mui/joy';
import { Prisma } from '@prisma/client';
import { Form, Link, useActionData, useNavigation, useParams } from '@remix-run/react';
import type { ActionFunctionArgs } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { redirect, slugify } from '~/utils.server';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const action = async ({ request, params, response }: ActionFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  const team = await ensureIsTeamMember(request, params.teamSlug);
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const url = formData.get('url') as string;
  const slug = slugify(name);

  if (slug === 'settings' || slug === 'members') {
    response!.status = 400;
    return { errors: { name: `"settings" and "members" are protected project names, chose a different name and try again` } };
  }

  try {
    const project = await prismaClient.project.create({
      data: {
        name,
        slug,
        url,
        teamSlug: team.slug,
        allowed_hosts: '',
      },
    });
    return redirect(response, `/dashboard/${team.slug}/${project.slug}`);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      response!.status = 400;
      return { errors: { name: `This team already contains a project named "${name}"` } };
    }
  }
  response!.status = 400;
  return { errors: { name: 'Something went wrong' } };
};

export default function CreateProject() {
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  const { teamSlug } = useParams();
  return (
    <Card>
      <Typography gutterBottom level='h3'>
        Create project
      </Typography>
      <Stack component={Form} gap={1} method='post'>
        <FormControl id='name' required>
          <FormLabel id='name-label'>Project name</FormLabel>
          <Input disabled={state === 'submitting'} error={Boolean(actionData?.errors?.name)} name='name' />
        </FormControl>
        <FormControl id='url' required>
          <FormLabel id='url-label'>Website url</FormLabel>
          <Input disabled={state === 'submitting'} name='url' type='url' />
        </FormControl>
        <Stack direction='row' gap={1}>
          <Button loading={state === 'submitting'} type='submit'>
            Save
          </Button>
          <Button component={Link} to={`/dashboard/${teamSlug}`} unstable_viewTransition variant='plain'>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
