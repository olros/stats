import { Form, Outlet, useActionData, useLoaderData, useNavigation, type MetaArgs_SingleFetch } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { LinkTabs } from '~/components/LinkTabs';
import invariant from 'tiny-invariant';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Typography } from '~/components/typography';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '~/components/ui/sheet';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { redirect, slugify } from '~/utils.server';
import { prismaClient } from '~/prismaClient';
import { Prisma } from '@prisma/client';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta = ({ data }: MetaArgs_SingleFetch<typeof loader>) => [{ title: `${data?.team.name} | Stats` }];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  return { team: await ensureIsTeamMember(request, params.teamSlug) };
};

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

const TABS = [
  { label: 'Projects', url: '' },
  { label: 'Members', url: 'members' },
  { label: 'Usage', url: 'usage' },
  { label: 'Settings', url: 'settings' },
];

export default function ProjectDashboard() {
  const { team } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  return (
    <>
      <Card className='flex-column flex items-center justify-between gap-2 [view-transition-name:team-card] sm:flex-row'>
        <Typography variant='h1' className='py-1 [view-transition-name:team-name]'>
          {team.name}
        </Typography>
        <Sheet>
          <SheetTrigger asChild>
            <Button>New project</Button>
          </SheetTrigger>
          <SheetContent side='right'>
            <SheetHeader className='mb-2'>
              <SheetTitle>Create team</SheetTitle>
            </SheetHeader>
            <Form className='flex flex-col gap-2' method='post'>
              <Label htmlFor='name'>Project name</Label>
              <Input required id='name' disabled={state === 'submitting'} error={Boolean(actionData?.errors?.name)} name='name' />
              <Label htmlFor='url'>Website url</Label>
              <Input required id='url' disabled={state === 'submitting'} name='url' type='url' />
              <div className='mt-4 flex gap-2'>
                <Button disabled={state === 'submitting'} type='submit'>
                  Save
                </Button>
                <SheetClose asChild>
                  <Button variant='link'>Cancel</Button>
                </SheetClose>
              </div>
            </Form>
          </SheetContent>
        </Sheet>
      </Card>
      <LinkTabs aria-label='Select team page' baseLocation={`/dashboard/${team.slug}`} key={team.slug} tabs={TABS} />
      <Outlet />
    </>
  );
}
