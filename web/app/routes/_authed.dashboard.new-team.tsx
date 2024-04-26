import { Prisma } from '@prisma/client';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import type { ActionFunctionArgs } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';
import { Typography } from '~/components/typography';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
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
      <Typography variant='h1'>Create team</Typography>
      <Form method='post'>
        <Label htmlFor='name'>Team name</Label>
        <Input id='name' required disabled={state === 'submitting'} error={Boolean(actionData?.errors.name)} name='name' />
        <div className='mt-4 flex gap-2'>
          <Button disabled={state === 'submitting'} className='[view-transition-name:create-team]' type='submit'>
            Save
          </Button>
          <Button variant='link' asChild>
            <Link to='/dashboard' unstable_viewTransition>
              Cancel
            </Link>
          </Button>
        </div>
      </Form>
    </Card>
  );
}
