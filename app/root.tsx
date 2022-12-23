import type { MetaFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import StylesContext from '~/styles/server.context';
import { useContext } from 'react';

export { CatchBoundary, ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Stats',
  viewport: 'width=device-width,initial-scale=1',
});

interface DocumentProps {
  children: React.ReactNode;
}

const Document = ({ children }: DocumentProps) => {
  const styleData = useContext(StylesContext);

  return (
    <html lang='no'>
      <head>
        <link href='/apple-touch-icon.png' rel='apple-touch-icon' sizes='180x180' />
        <link href='/favicon-32x32.png' rel='icon' sizes='32x32' type='image/png' />
        <link href='/favicon-16x16.png' rel='icon' sizes='16x16' type='image/png' />
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
