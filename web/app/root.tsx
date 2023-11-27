import FontStyles from '@fontsource-variable/inter/index.css';
import { Box } from '@mui/joy';
import type { LinksFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLocation, useParams } from '@remix-run/react';
import { ErrorBoundary as BaseErrorBoundary } from '~/components/ErrorBoundary';
import StylesContext from '~/styles/server.context';
import { useContext, useEffect } from 'react';

import { stats } from './stats';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: FontStyles }];

export const ErrorBoundary = () => (
  <Document>
    <BaseErrorBoundary />
  </Document>
);

type DocumentProps = {
  children: React.ReactNode;
};

const Document = ({ children }: DocumentProps) => {
  const styleData = useContext(StylesContext);

  const location = useLocation();
  const params = useParams<Record<string, string>>();

  useEffect(() => {
    const pathname = Object.entries(params as Record<string, string>).reduce((path, [key, param]) => path.replace(`/${param}`, `/:${key}`), location.pathname);
    stats.pageview({ pathname });
  }, [location.pathname, location.search, params]);

  return (
    <html data-joy-color-scheme='dark' lang='no'>
      <head>
        <link href='/favicon-180.png' rel='apple-touch-icon' sizes='180x180' />
        <link href='/favicon-32.png' rel='icon' sizes='32x32' type='image/png' />
        <link href='/favicon-16.png' rel='icon' sizes='16x16' type='image/png' />
        <link href='/manifest.json' rel='manifest' />
        <Meta />
        <meta charSet='utf-8' />
        <title>Stats</title>
        <meta content='width=device-width,initial-scale=1' name='viewport' />
        <Links />
        {styleData?.map(({ key, ids, css }) => (
          <style
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: css }}
            data-emotion={`${key} ${ids.join(' ')}`}
            key={key}
          />
        ))}
      </head>
      <body>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            background: ({ palette }) =>
              `linear-gradient(${palette.success[100]}, transparent), linear-gradient(-45deg, ${palette.danger[500]}, transparent), linear-gradient(45deg, ${palette.primary[500]}, transparent)`,
            backgroundBlendMode: 'multiply',
            opacity: 0.2,
          }}
        />
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}
