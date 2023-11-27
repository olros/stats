import { keyframes } from '@emotion/react';
import { Box, Button, Card, Container, Divider, Stack, Typography } from '@mui/joy';
import { Form } from '@remix-run/react';
import { type LoaderFunctionArgs, redirect } from '@vercel/remix';
import { authenticator } from '~/auth.server';
import { useWindowSize } from '~/hooks/useWindowSize';
import { stats } from '~/stats';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    return redirect(`/dashboard`);
  }
  return null;
};

const smScaleAnimation = keyframes({
  from: { ry: '100', rx: '100', opacity: 1 },
  to: { ry: '200', rx: '200', opacity: 0.6 },
});

const mdScaleAnimation = keyframes({
  from: { ry: '200', rx: '200', opacity: 1 },
  to: { ry: '400', rx: '400', opacity: 0.6 },
});

const smAnimation = `${smScaleAnimation} 6s ease-in-out alternate infinite`;
const mdAnimation = `${mdScaleAnimation} 6s ease-in-out alternate infinite`;

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
  {
    emoji: '📦',
    heading: 'NPM-package',
    description: 'Install a lightweight NPM-package with Typescript-types and ESM-compability to get started quickly.',
  },
  {
    emoji: '🌐',
    heading: 'API',
    description: "Don't want to use NPM? Or don't you use a Javascript based application? Use the API-endpoints to send pageviews and events manually.",
  },
  {
    emoji: '🔗',
    heading: 'Share publicly',
    description:
      'You can enable a public view which allows not-signed-in users to view your application stats. Check out the "Live Demo" to see how this works',
  },
  {
    emoji: '🧾',
    heading: 'Generous usage quota',
    description:
      'Stats is completely free within a very generous per-team quota. If you reach your quota, you can still see your statistics but Stats will stop storing more events.',
  },
];

export default function Index() {
  const { width, height } = useWindowSize();
  return (
    <>
      <Box
        component='svg'
        height='100%'
        preserveAspectRatio='none'
        sx={{ position: 'fixed', inset: 0, zIndex: -1, opacity: 0.6 }}
        version='1.1'
        viewBox={`0 0 ${width ?? 1000} ${height ?? 1000}`}
        width='100%'
        xmlns='http://www.w3.org/2000/svg'>
        <defs>
          <filter
            colorInterpolationFilters='sRGB'
            filterUnits='objectBoundingBox'
            height='400%'
            id='bbblurry-filter'
            primitiveUnits='userSpaceOnUse'
            width='400%'
            x='-100%'
            y='-100%'>
            <feGaussianBlur edgeMode='none' height='100%' in='SourceGraphic' result='blur' stdDeviation='93' width='100%' x='0%' y='0%'></feGaussianBlur>
          </filter>
        </defs>
        <Box component='g' filter='url(#bbblurry-filter)' sx={{ opacity: height && width ? 1 : 0, transition: '1s opacity' }}>
          <Box component='ellipse' cx='20%' cy='20%' sx={{ fill: 'hsl(37, 99%, 67%)', animation: { xs: smAnimation, md: mdAnimation } }} />
          <Box component='ellipse' cx='80%' cy='50%' sx={{ fill: 'hsl(316, 73%, 52%)', animation: { xs: smAnimation, md: mdAnimation } }} />
          <Box component='ellipse' cx='45%' cy='80%' sx={{ fill: 'hsl(185, 100%, 57%)', animation: { xs: smAnimation, md: mdAnimation } }} />
        </Box>
      </Box>
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
          <Form action='/auth/github' method='POST'>
            <Button type='submit'>Continue with GitHub</Button>
          </Form>
          <Button color='neutral' component='a' href='/public/olros/stats' onClick={() => stats.event('live-demo')} target='_blank' variant='outlined'>
            Live demo
          </Button>
        </Stack>
        <Divider sx={{ my: 4 }} />
        <Typography level='h2'>Features</Typography>
        <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 1, md: 2 }, p: { xs: 1, md: 2 } }}>
          {FEATURES.map((feature, i) => (
            <Card key={i} sx={{ background: ({ palette }) => palette.background.backdrop, backdropFilter: `blur(10px)` }}>
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
    </>
  );
}
