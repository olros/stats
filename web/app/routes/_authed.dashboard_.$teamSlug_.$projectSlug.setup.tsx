import type { CardProps, TypographyProps } from '@mui/joy';
import { Card, styled, Typography } from '@mui/joy';
import { useParams } from '@remix-run/react';
import type { ReactNode } from 'react';

export { ErrorBoundary } from '~/components/ErrorBoundary';

const Description = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  overflowWrap: 'anywhere',
}));

const Code = ({ children, gutterBottom = true, ...props }: { children: ReactNode } & CardProps & TypographyProps) => (
  <Card
    gutterBottom={gutterBottom}
    sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
    variant='soft'
    {...props}
    component={Typography}>
    {children}
  </Card>
);

export default function ProjectSetup() {
  const { teamSlug, projectSlug } = useParams() as { teamSlug: string; projectSlug: string };
  return (
    <>
      <Card>
        <Typography level='h3'>{`Javascript snippet`}</Typography>
        <Description>{`Include this snippet in the <head> of your website to register pageviews`}</Description>
        <Code gutterBottom={false}>
          {`<script data-project='${projectSlug}' data-team='${teamSlug}' defer src='https://stats.olafros.com/script.js'></script>`}
        </Code>
      </Card>
      <Card>
        <Typography level='h3'>{`NPM-package`}</Typography>
        <Description>
          Import{' '}
          <Typography component='span' sx={{ fontFamily: 'monospace' }} variant='soft'>
            {`@olros/stats`}
          </Typography>
          :
        </Description>
        <Code>{`yarn add @olros/stats`}</Code>
        <Description>Create an instance of Stats:</Description>
        <Code>
          {`// utils/stats.ts
import { Stats } from '@olros/stats';

const TEAM = '${teamSlug}';
const PROJECT = '${projectSlug}';

export const stats = Stats({ team: TEAM, project: PROJECT });`}
        </Code>
        <Description>
          Use the{' '}
          <Typography component='span' sx={{ fontFamily: 'monospace' }} variant='soft'>
            {`stats.pageview`}
          </Typography>
          -method on each pagenavigation to track pageviews. Example from React with React-Router:
        </Description>
        <Code gutterBottom={false}>
          {`// route.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { stats } from 'utils/stats'; // Import the stats-instance

// ...

const location = useLocation();

useEffect(() => {
  stats.pageview();
}, [location.pathname, location.search]);`}
        </Code>
        <Description>
          Use the{' '}
          <Typography component='span' sx={{ fontFamily: 'monospace' }} variant='soft'>
            {`stats.event`}
          </Typography>
          -method to track custom events:
        </Description>
        <Code gutterBottom={false}>
          {`// route.ts
import { stats } from 'utils/stats'; // Import the stats-instance

// ...

const handleClick = () => {
  stats.event('buy');
}`}
        </Code>
      </Card>
      <Card>
        <Typography level='h3'>{`HTTP-request`}</Typography>
        <Description>{`You can also manually send a HTTP-request to our api to register pageviews or custom events.`}</Description>
        <Typography level='h4'>{`Pageviews`}</Typography>
        <Description>
          Send POST-request to{' '}
          <Typography component='span' sx={{ fontFamily: 'monospace' }} variant='soft'>
            {`https://stats.olafros.com/api/${teamSlug}/${projectSlug}/pageview/`}
          </Typography>
          {' with a body containing pathname and optionally referrer.'}
        </Description>
        <Description>{`Example using Javascript:`}</Description>
        <Code gutterBottom={false}>
          {`const data = {
  pathname: location.pathname,
  referrer: document.referrer,
};

// You can use either navigator.sendBeacon:
navigator.sendBeacon('https://stats.olafros.com/api/${teamSlug}/${projectSlug}/pageview/', JSON.stringify(data));

// or fetch:
fetch('https://stats.olafros.com/api/${teamSlug}/${projectSlug}/pageview/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  mode: 'no-cors',
  credentials: 'omit',
});`}
        </Code>
        <Typography level='h4' sx={{ mt: 2 }}>{`Custom events`}</Typography>
        <Description>
          Send POST-request to{' '}
          <Typography component='span' sx={{ fontFamily: 'monospace' }} variant='soft'>
            {`https://stats.olafros.com/api/${teamSlug}/${projectSlug}/event/`}
          </Typography>
          {' with a body containing name of the custom event.'}
        </Description>
        <Description>{`Example using Javascript:`}</Description>
        <Code gutterBottom={false}>
          {`const data = {
  name: 'buy',
};

// You can use either navigator.sendBeacon:
navigator.sendBeacon('https://stats.olafros.com/api/${teamSlug}/${projectSlug}/event/', JSON.stringify(data));

// or fetch:
fetch('https://stats.olafros.com/api/${teamSlug}/${projectSlug}/event/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  mode: 'no-cors',
  credentials: 'omit',
});`}
        </Code>
      </Card>
    </>
  );
}
