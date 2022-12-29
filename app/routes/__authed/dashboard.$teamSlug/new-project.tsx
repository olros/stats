import { Button, Card, Stack, TextField, Typography } from '@mui/joy';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
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
  await ensureIsTeamMember(request, params.teamSlug);
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const url = formData.get('url') as string;
  try {
    const project = await prismaClient.project.create({
      data: {
        name,
        slug: slugify(name),
        url,
        teamSlug: params.teamSlug.toLowerCase(),
      },
    });
    return redirect(`/dashboard/${params.teamSlug}/${project.slug}`);
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      return json({ errors: { name: 'This team already contains a project with this name' } });
    }
  }
  return json({ errors: { name: 'Something went wrong' } });
};

export default function CreateProject() {
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  const { teamSlug } = useParams();
  return (
    <Card>
      <Typography gutterBottom level='h1'>
        Create project
      </Typography>
      <Stack component={Form} gap={1} method='post'>
        <TextField
          disabled={state === 'submitting'}
          error={Boolean(actionData?.errors?.name)}
          helperText={actionData?.errors?.name}
          id='name'
          label='Project name'
          name='name'
          required
        />
        <TextField disabled={state === 'submitting'} id='url' label='Website url' name='url' required type='url' />
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
