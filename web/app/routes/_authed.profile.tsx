import { Avatar, Button, Card, Stack, Typography } from '@mui/joy';
import { Link, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';

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
      <Stack alignItems='center' direction='row' gap={1}>
        <Avatar alt={`Profile image of ${user.name}`} size='lg' src={user.avatar_url || undefined} sx={{ viewTransitionName: 'avatar' }}>
          {user.name[0]}
        </Avatar>
        <Typography level='h1'>{user.name}</Typography>
      </Stack>
      <Typography level='body-lg'>Email: {user.email}</Typography>
      <Typography level='body-lg'>GitHub: {user.github_username}</Typography>
      <Button color='danger' component={Link} sx={{ mt: 2 }} to='/auth/logout' variant='outlined'>
        Log out
      </Button>
    </Card>
  );
}
