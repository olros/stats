import { Box, Button, Card, Container, Divider, Stack, Typography } from '@mui/joy';
import { Form, Link, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { authenticator } from '~/auth.server';
import { stats } from '~/stats';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
    description: 'No cookie-usage. Can be self-hosted. Unique users are counted on a daily basis, making it impossible to track users over a period of time.',
  },
  {
    emoji: '🌍',
    heading: 'Locations',
    description: 'View which locations your visitors visit your application from, and how many from each location. Both visualized on a map and in a list.',
  },
  {
    emoji: '✏️',
    heading: 'Custom events',
    description: 'Want to know how many times particular button is clicked? Track custom events and view how your application is used.',
  },
  {
    emoji: '🧮',
    heading: 'Unique visitors',
    description:
      "View how many unique users visits your application. Visitors are counted by storing a hashed combination of the user's IP-adress, today's date, the user-agent, and a secret key.",
  },
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
        A simple and easy to use analytics-tool
        <br />
        for all applications.
      </Typography>
      <Typography level='body-lg' sx={{ mb: 4, px: 2 }} textAlign='center'>
        No need for a cookie-banner as no cookies are used, ever. Easy to add to your website with a lightweight script, NPM-package or by manually sending
        HTTP-requests, choose whichever fits your application best! Server-side tracking are also supported!
      </Typography>
      <Stack direction='row' gap={2} justifyContent='center'>
        {isAuthenticated ? (
          <Button component={Link} to='/dashboard' unstable_viewTransition>
            Open dashboard
          </Button>
        ) : (
          <Box action='/auth/github' component={Form} method='post'>
            <Button type='submit'>Continue with GitHub</Button>
          </Box>
        )}
        <Button component='a' href='/public/olros/stats' onClick={() => stats.event('live-demo')} target='_blank' variant='outlined'>
          Live demo
        </Button>
      </Stack>
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
      <Typography component='a' href='https://github.com/olros/stats' sx={{ textAlign: 'center', my: 2 }} target='_blank'>
        @olros/stats
      </Typography>
    </Container>
  );
}
