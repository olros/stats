import { Button, Card, FormControl, FormLabel, Input, Stack, Typography } from '@mui/joy';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { ActionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation, useParams } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { slugify } from '~/utils';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const action = async ({ request, params }: ActionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  const team = await ensureIsTeamMember(request, params.teamSlug);
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const url = formData.get('url') as string;
  const slug = slugify(name);

  if (slug === 'settings' || slug === 'members') {
    return json({ errors: { name: `"settings" and "members" are protected project names, chose a different name and try again` } }, { status: 400 });
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
    return redirect(`/dashboard/${team.slug}/${project.slug}`);
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      return json({ errors: { name: `This team already contains a project named "${name}"` } }, { status: 400 });
    }
  }
  return json({ errors: { name: 'Something went wrong' } }, { status: 400 });
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
          <Button component={Link} to={`/dashboard/${teamSlug}`} variant='plain'>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
