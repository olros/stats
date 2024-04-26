import { useParams } from '@remix-run/react';
import { ReactNode } from 'react';

import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import codeStyle from 'react-syntax-highlighter/dist/esm/styles/prism/coldark-dark';

import { Typography, TypographyProps } from '~/components/typography';
import { Card } from '~/components/ui/card';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('bash', bash);

export { ErrorBoundary } from '~/components/ErrorBoundary';

const Description = ({ children }: { children: ReactNode }) => <Typography className='break-words'>{children}</Typography>;

const Pre = ({ children, ...props }: TypographyProps) => (
  <Typography className='!p-4 text-md [&_code]:text-inherit bg-slate-500 !m-0 rounded-md' asChild {...props}>
    <pre>{children}</pre>
  </Typography>
);

const Code = ({ children, language = 'javascript' }: { children: ReactNode; language?: 'javascript' | 'bash' }) => {
  return (
    // @ts-ignore
    <SyntaxHighlighter PreTag={Pre} language={language} style={codeStyle}>
      {children}
    </SyntaxHighlighter>
  );
};

export default function ProjectSetup() {
  const { teamSlug, projectSlug } = useParams() as { teamSlug: string; projectSlug: string };
  return (
    <>
      <Card>
        <Typography variant='h3'>Javascript snippet</Typography>
        <Description>{`Include this snippet in the <head> of your website to automatically register pageviews on load.`}</Description>
        <Code>{`<script data-project='${projectSlug}' data-team='${teamSlug}' defer src='https://stats.olafros.com/script.js'></script>`}</Code>
        <Description>
          The script also add{' '}
          <Typography asChild className='font-mono'>
            <span>__stats</span>
          </Typography>{' '}
          to window, giving you access register events and pageviews programatically:
        </Description>
        <Code>
          {`// Register pageview:
window.__stats.pageview({
  pathname: location.pathname,
  referrer: document.referrer,
});

// Register event:
window.__stats.event('buy');`}
        </Code>
      </Card>
      <Card>
        <Typography variant='h3'>NPM-package</Typography>
        <Description>
          Import{' '}
          <Typography asChild className='font-mono'>
            <span>@olros/stats</span>
          </Typography>
          :
        </Description>
        <Code language='bash'>npm i @olros/stats</Code>
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
          <Typography asChild className='font-mono'>
            <span>stats.pageview</span>
          </Typography>
          -method on each pagenavigation to track pageviews. Example from React with React-Router:
        </Description>
        <Code>
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
          <Typography asChild className='font-mono'>
            <span>stats.event</span>
          </Typography>
          -method to track custom events:
        </Description>
        <Code>
          {`// route.ts
import { stats } from 'utils/stats'; // Import the stats-instance

// ...

const handleClick = () => {
  stats.event('buy');
}`}
        </Code>
      </Card>
      <Card>
        <Typography variant='h3'>HTTP-request</Typography>
        <Description>You can also manually send a HTTP-request to our api to register pageviews or custom events.</Description>
        <Typography variant='h4' className='mt-4'>
          Pageviews
        </Typography>
        <Description>
          Send POST-request to{' '}
          <Typography asChild className='font-mono'>
            <span>{`https://stats.olafros.com/api/${teamSlug}/${projectSlug}/pageview/`}</span>
          </Typography>
          {' with a body containing pathname and optionally referrer.'}
        </Description>
        <Description>Example using Javascript:</Description>
        <Code>
          {`const data = {
  pathname: location.pathname,
  referrer: document.referrer,
};

// You can use both navigator.sendBeacon:
navigator.sendBeacon('https://stats.olafros.com/api/${teamSlug}/${projectSlug}/pageview/', JSON.stringify(data));

// and fetch:
fetch('https://stats.olafros.com/api/${teamSlug}/${projectSlug}/pageview/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  mode: 'no-cors',
  credentials: 'omit',
});`}
        </Code>
        <Typography variant='h4' className='mt-4'>
          Custom events
        </Typography>
        <Description>
          Send POST-request to{' '}
          <Typography asChild className='font-mono'>
            <span>{`https://stats.olafros.com/api/${teamSlug}/${projectSlug}/event/`}</span>
          </Typography>
          {' with a body containing name of the custom event.'}
        </Description>
        <Description>Example using Javascript:</Description>
        <Code>
          {`const data = {
  name: 'buy',
};

// You can use both navigator.sendBeacon:
navigator.sendBeacon('https://stats.olafros.com/api/${teamSlug}/${projectSlug}/event/', JSON.stringify(data));

// and fetch:
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
