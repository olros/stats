import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Typography } from '~/components/typography';
import { Card } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  const team = await ensureIsTeamMember(request, params.teamSlug);

  const formData = await request.formData();

  if (request.method === 'POST') {
    const githubUsername = formData.get('github_username') as string;

    const user = await prismaClient.user.findFirst({
      where: {
        github_username: {
          equals: githubUsername,
          mode: 'insensitive',
        },
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
      <Card>
        <Typography variant='h3'>Add member</Typography>
        <Typography>
          The member to be added must have already logged in to Stats with their GitHub-profile before they can be added to teams. All team members have the
          same rights within the team to create, edit and delete projects and the team itself.
        </Typography>
        <Form method='POST'>
          <Label htmlFor='github_username'>GitHub username</Label>
          <Input id='github_username' error={Boolean(errors?.github_username)} required disabled={state === 'submitting'} name='github_username' />
          {Boolean(errors?.github_username) && (
            <Typography className='mt-1' variant='small'>
              {errors?.github_username}
            </Typography>
          )}
          <Button className='mt-4' disabled={state === 'submitting'} type='submit'>
            Add member
          </Button>
        </Form>
      </Card>
      {members.map((member) => (
        <Card key={member.user.id} className='flex items-center gap-2'>
          <Avatar>
            <AvatarImage alt={`Profile image of ${member.user.name}`} src={member.user.avatar_url || undefined} />
            <AvatarFallback>{member.user.name[0]}</AvatarFallback>
          </Avatar>
          <Typography variant='large' className='flex-1'>
            {member.user.name}
          </Typography>
          {members.length > 1 && (
            <Form method='delete'>
              <Button disabled={state === 'submitting'} name='userId' type='submit' value={member.user.id} variant='destructive'>
                Remove
              </Button>
            </Form>
          )}
        </Card>
      ))}
    </>
  );
}
