import { Prisma } from '@prisma/client';
import { Form, Link, useActionData, useNavigation, useParams } from '@remix-run/react';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { slugify } from '~/utils';
import invariant from 'tiny-invariant';
import { Card } from '~/components/ui/card';
import { Typography } from '~/components/typography';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const action = async ({ request, params }: ActionFunctionArgs) => {
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
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
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
      <Typography className='mb-4' variant='h3'>
        Create project
      </Typography>
      <Form className='flex flex-col gap-2' method='post'>
        <Label htmlFor='name'>Project name</Label>
        <Input required id='name' disabled={state === 'submitting'} error={Boolean(actionData?.errors?.name)} name='name' />
        <Label htmlFor='url'>Website url</Label>
        <Input required id='url' disabled={state === 'submitting'} name='url' type='url' />
        <div className='flex gap-2 mt-4'>
          <Button disabled={state === 'submitting'} type='submit'>
            Save
          </Button>
          <Button variant='link'>
            <Link to={`/dashboard/${teamSlug}`} unstable_viewTransition>
              Cancel
            </Link>
          </Button>
        </div>
      </Form>
    </Card>
  );
}
