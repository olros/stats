import { Box, Button, Card, Container, Divider, Stack, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { authenticator } from '~/auth.server';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderArgs) => {
  const isAuthenticated = await authenticator.isAuthenticated(request);

  return json({ isAuthenticated });
};

const FEATURES: { emoji: string; heading: string; description: string }[] = [
  {
    emoji: '👫',
    heading: 'Teams',
    description:
      'Easily work in teams by having multiple members in each team. Users can be member of multiple teams and each team can have multiple projects.',
  },
  {
    emoji: '📈',
    heading: 'Trends',
    description:
      'Track pageviews and view the trend. See which times of the day which is most popular. Filter by pages and separate by desktop, tablets and mobiles.',
  },
  {
    emoji: '🔒',
    heading: 'Privacy-friendly',
    description: 'No cookie-usage. Can be self-hosted. Generated data is saved in an aggregated manner, making it impossible to track individual users',
  },
  {
    emoji: '🆓',
    heading: 'Free',
    description:
      'The way pageviews, events and unique users are stored makes the consumed storage low. This makes hosting cheap and Stats can be free! (At least for now)',
  },
  // {
  //   emoji: '✏️',
  //   heading: 'Custom events (soon)',
  //   description: 'Want to know how many clicks a particular button? Track custom events and view how the engagement evolves through time.',
  // },
  // {
  //   emoji: '🧮',
  //   heading: 'Unique users (soon)',
  //   description: 'View amount of unique users and how the amount evolves through time.',
  // },
];

export default function Index() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  return (
    <Container alignItems='center' component={Stack} sx={{ display: 'flex' }}>
      <Typography
        level='h1'
        sx={{
          fontSize: { xs: '6rem', md: '10rem' },
          background: 'linear-gradient(170deg, purple 0%, red 100%)',
          fontWeight: '900',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          pt: 4,
          pb: 2,
        }}
        textAlign='center'>
        Stats
      </Typography>
      <Typography gutterBottom level='h2' textAlign='center'>
        A simple, free and easy to use analytics-tool
        <br />
        for all of your applications.
      </Typography>
      <Typography level='body1' sx={{ mb: 4, px: 2 }} textAlign='center'>
        No need for a cookie-banner as no cookies are used, ever. Easy to add to your website with a lightweight script, NPM-package or by manually sending
        HTTP-requests, whichever fits your application best! Server-side tracking are also supported!
      </Typography>
      {isAuthenticated ? (
        <Button component={Link} to='/dashboard'>
          Open your dashboard
        </Button>
      ) : (
        <Stack action='/auth/github' component={Form} direction='row' gap={2} justifyContent='center' method='post'>
          <Button color='info' sx={{ margin: 'auto' }} type='submit'>
            Login with GitHub
          </Button>
          <Button color='info' sx={{ margin: 'auto' }} type='submit' variant='outlined'>
            Sign up with GitHub
          </Button>
        </Stack>
      )}
      <Divider sx={{ my: 4 }} />
      <Typography level='h2'>Features</Typography>
      <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 1, md: 2 }, p: { xs: 1, md: 2 } }}>
        {FEATURES.map((feature, i) => (
          <Card key={i}>
            <Typography gutterBottom level='h3'>
              {feature.emoji}{' '}
              <Typography
                component='span'
                sx={{
                  background: 'linear-gradient(0deg, lightgreen 0%, orange 100%)',
                  fontWeight: '800',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                }}>
                {feature.heading}
              </Typography>
            </Typography>
            <Typography>{feature.description}</Typography>
          </Card>
        ))}
      </Box>
      <Typography component='a' href='https://github.com/olros/stats' sx={{ my: 2 }} target='_blank'>
        @olros/stats
      </Typography>
    </Container>
  );
}
