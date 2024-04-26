import { Link, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';
import { Card } from '~/components/ui/card';
import { Typography } from '~/components/typography';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction = () => [{ title: 'Profile | Stats' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserOrRedirect(request);
  return { user };
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Card>
      <div className='flex items-center gap-2'>
        <Avatar>
          <AvatarImage alt={`Profile image of ${user.name}`} src={user.avatar_url || undefined} className='[view-transition-name:avatar]' />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <Typography variant='h1'>{user.name}</Typography>
      </div>
      <Typography>Email: {user.email}</Typography>
      <Typography className='!mt-0'>GitHub: {user.github_username}</Typography>
      <Button className='mt-4' asChild variant='destructive'>
        <Link to='/auth/logout'>Log out</Link>
      </Button>
    </Card>
  );
}
