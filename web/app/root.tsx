import '@fontsource-variable/inter/index.css';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation, useParams } from '@remix-run/react';
import type { LinksFunction } from '@remix-run/node';
import { ErrorBoundary as BaseErrorBoundary } from '~/components/ErrorBoundary';
import { useEffect, useMemo } from 'react';

import { stats } from './stats';

import styles from './globals.css?url';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export const ErrorBoundary = () => <BaseErrorBoundary />;

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const params = useParams<Record<string, string>>();
  const pathname = useMemo(
    () => Object.entries(params as Record<string, string>).reduce((path, [key, param]) => path.replace(`/${param}`, `/:${key}`), location.pathname),
    [location.pathname, params],
  );

  useEffect(() => {
    stats.pageview({ pathname });
  }, [pathname]);

  return (
    <html lang='no'>
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
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

export default function App() {
  return <Outlet />;
}
