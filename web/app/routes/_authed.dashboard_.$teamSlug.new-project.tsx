import { Prisma } from '@prisma/client';
import { Form, Link, useActionData, useNavigation, useParams } from '@remix-run/react';
import type { ActionFunctionArgs } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { redirect, slugify } from '~/utils.server';
import invariant from 'tiny-invariant';
import { Card } from '~/components/ui/card';
import { Typography } from '~/components/typography';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

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
      <Typography className='mb-4' variant='h3'>
        Create project
      </Typography>
      <Form className='flex flex-col gap-2' method='post'>
        <Label htmlFor='name'>Project name</Label>
        <Input required id='name' disabled={state === 'submitting'} error={Boolean(actionData?.errors?.name)} name='name' />
        <Label htmlFor='url'>Website url</Label>
        <Input required id='url' disabled={state === 'submitting'} name='url' type='url' />
        <div className='mt-4 flex gap-2'>
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
