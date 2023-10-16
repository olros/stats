import { Avatar, Button, Card, FormControl, FormHelperText, FormLabel, Input, Tooltip, Typography } from '@mui/joy';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import type { ActionArgs, LoaderArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  const members = prismaClient.teamUser.findMany({
    select: {
      user: true,
    },
    where: {
      team: {
        slug: params.teamSlug.toLowerCase(),
      },
    },
  });

  return json({ members: await members });
};

export const action = async ({ request, params }: ActionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  const team = await ensureIsTeamMember(request, params.teamSlug);

  const formData = await request.formData();

  if (request.method === 'POST') {
    const githubUsername = formData.get('github_username') as string;

    const user = await prismaClient.user.findFirst({
      where: {
        github_username: githubUsername,
      },
    });

    if (!user) {
      return json({ errors: { github_username: 'No users exists with this GitHub username' } }, { status: 400 });
    }

    await prismaClient.teamUser.create({
      data: {
        teamId: team.id,
        userId: user.id,
      },
    });

    return json({ detail: 'Member successfully added to the team' });
  }
  if (request.method === 'DELETE') {
    const userId = formData.get('userId') as string;

    try {
      await prismaClient.teamUser.delete({
        where: {
          userId_teamId: {
            teamId: team.id,
            userId,
          },
        },
      });

      return json({ detail: 'Member successfully removed from the team' });
    } catch {
      return json({ errors: { userId: 'Something went wrong' } }, { status: 400 });
    }
  }
};

export default function TeamMembers() {
  const { members } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();

  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const errors = actionData?.errors as Record<string, string> | undefined;

  return (
    <>
      <Card component={Form} method='post' sx={{ gap: 1 }}>
        <Typography level='h3'>Add member</Typography>
        <Typography level='body-md'>
          The member to be added must have already logged in to Stats with their GitHub-profile before they can be added to teams. All team members have the
          same rights within the team to create, edit and delete projects and the team itself.
        </Typography>
        <FormControl error={Boolean(errors?.github_username)} id='github_username' required>
          <FormLabel id='github_username-label'>GitHub username</FormLabel>
          <Input disabled={state === 'submitting'} name='github_username' />
          {Boolean(errors?.github_username) && <FormHelperText>{errors?.github_username}</FormHelperText>}
        </FormControl>
        <Button loading={state === 'submitting'} type='submit'>
          Add member
        </Button>
      </Card>
      {members.map((member) => (
        <Card key={member.user.id} orientation='horizontal' sx={{ gap: 1, alignItems: 'center' }}>
          <Avatar alt={`Profile image of ${member.user.name}`} src={member.user.avatar_url || undefined}>
            {member.user.name[0]}
          </Avatar>
          <Typography fontSize='xl' sx={{ flex: 1 }}>
            {member.user.name}
          </Typography>
          <Tooltip arrow title={members.length === 1 ? 'There must be at least 1 member left in the team' : ''}>
            <Form method='delete'>
              <Button
                color='danger'
                disabled={state === 'submitting' || members.length === 1}
                name='userId'
                type='submit'
                value={member.user.id}
                variant='outlined'>
                Remove
              </Button>
            </Form>
          </Tooltip>
        </Card>
      ))}
    </>
  );
}
