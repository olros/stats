import { Stats } from '@olros/stats';
import type { MetaFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from '@remix-run/react';
import { ErrorBoundary as BaseErrorBoundary } from '~/components/ErrorBoundary';
import StylesContext from '~/styles/server.context';
import { useContext, useEffect } from 'react';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Stats',
  viewport: 'width=device-width,initial-scale=1',
});

export const ErrorBoundary = () => (
  <Document>
    <BaseErrorBoundary />
  </Document>
);

type DocumentProps = {
  children: React.ReactNode;
};

const stats = Stats({
  team: 'olros',
  project: 'stats',
  allowLocalhost: process.env.NODE_ENV === 'development',
  baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined,
});

const Document = ({ children }: DocumentProps) => {
  const styleData = useContext(StylesContext);

  const location = useLocation();

  useEffect(() => {
    stats.pageview();
  }, [location.pathname, location.search]);

  return (
    <html data-joy-color-scheme='dark' lang='no'>
      <head>
        <link href='/favicon-180.png' rel='apple-touch-icon' sizes='180x180' />
        <link href='/favicon-32.png' rel='icon' sizes='32x32' type='image/png' />
        <link href='/favicon-16.png' rel='icon' sizes='16x16' type='image/png' />
        <link href='/manifest.json' rel='manifest' />
        <Meta />
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
