import { Prisma } from '@prisma/client';
import { Form, NavLink, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';
import { Typography } from '~/components/typography';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { prismaClient } from '~/prismaClient';
import { redirect, slugify } from '~/utils.server';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserOrRedirect(request);
  const teams = await prismaClient.team.findMany({
    where: {
      teamUsers: {
        some: {
          userId: user.id,
        },
      },
    },
  });
  return { teams };
};

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

export default function Dashboard() {
  const { teams } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  return (
    <>
      <Card className='flex flex-col items-center justify-between gap-2 [view-transition-name:header-old] sm:flex-row'>
        <Typography variant='h1' className='[view-transition-name:header-old-tex]'>
          Your teams
        </Typography>
        <Sheet>
          <SheetTrigger asChild>
            <Button>New team</Button>
          </SheetTrigger>
          <SheetContent side='right'>
            <SheetHeader className='mb-2'>
              <SheetTitle>Create team</SheetTitle>
            </SheetHeader>
            <Form method='post'>
              <Label htmlFor='name'>Team name</Label>
              <Input id='name' required disabled={state === 'submitting'} error={Boolean(actionData?.errors.name)} name='name' />
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
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3'>
        {teams.map((team) => (
          <NavLink
            className='bg-card text-card-foreground rounded-xl border p-4 shadow hover:border-slate-600 [&.transitioning]:[view-transition-name:team-card] [&.transitioning]:*:[view-transition-name:team-name]'
            key={team.slug}
            to={team.slug}
            unstable_viewTransition>
            <Typography variant='h2' className='p-0'>
              {team.name}
            </Typography>
          </NavLink>
        ))}
      </div>
      {!teams.length && <Typography>You're not a member of any teams</Typography>}
    </>
  );
}
