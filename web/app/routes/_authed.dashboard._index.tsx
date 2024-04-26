import { Link, NavLink, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';
import { Typography } from '~/components/typography';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { prismaClient } from '~/prismaClient';

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
  return json({ teams });
};

export default function Dashboard() {
  const { teams } = useLoaderData<typeof loader>();
  return (
    <>
      <Card className='flex flex-col items-center justify-between gap-2 [view-transition-name:header-old] sm:flex-row'>
        <Typography variant='h1' className='[view-transition-name:header-old-tex]'>
          Your teams
        </Typography>
        <Button asChild>
          <Link className='[view-transition-name:create-team]' to='new-team' unstable_viewTransition>
            New team
          </Link>
        </Button>
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
