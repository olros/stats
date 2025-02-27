import { Form, redirect } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/auth.server';
import { Container } from '~/components/container';
import { RepositoryLink } from '~/components/repository-link';
import { Typography } from '~/components/typography';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { stats } from '~/stats';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    return redirect(`/dashboard`);
  }
  return null;
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
  return (
    <>
      <Container>
        <Typography
          variant='h1'
          className='bg-gradient-to-br from-green-700 to-blue-400 bg-clip-text pt-8 pb-4 text-center text-8xl font-black text-transparent md:text-[10rem] lg:text-[12rem]'>
          Stats
        </Typography>
        <Typography variant='h2' className='text-center'>
          A simple and easy to use analytics-tool
          <br />
          for all applications.
        </Typography>
        <Typography className='mb-8 px-4 text-center'>
          No need for a cookie-banner as no cookies are used, ever. Easy to add to your website with a lightweight script, NPM-package or by manually sending
          HTTP-requests, choose whichever fits your application best! Server-side tracking are also supported!
        </Typography>
        <div className='flex justify-center gap-4'>
          <Form action='/auth/github' method='POST'>
            <Button type='submit'>Continue with GitHub</Button>
          </Form>
          <Button asChild onClick={() => stats.event('live-demo')} variant='outline'>
            <a href='/public/olros/stats' target='_blank'>
              Live demo
            </a>
          </Button>
        </div>
        <Separator className='my-8' />
        <Typography variant='h2' className='text-center'>
          Features
        </Typography>
        <div className='grid w-full grid-cols-1 gap-2 p-2 sm:grid-cols-2 sm:gap-4 sm:p-4'>
          {FEATURES.map((feature, i) => (
            <Card key={i}>
              <Typography variant='h3'>
                {feature.emoji}{' '}
                <Typography className='bg-gradient-to-br from-green-600 to-blue-400 bg-clip-text font-extrabold text-transparent' asChild>
                  <span>{feature.heading}</span>
                </Typography>
              </Typography>
              <Typography>{feature.description}</Typography>
            </Card>
          ))}
        </div>
        <RepositoryLink />
      </Container>
    </>
  );
}
