import { CacheProvider } from '@emotion/react';
import { CssBaseline, CssVarsProvider } from '@mui/joy';
import type { RemixServerProps } from '@remix-run/react';
import { RemixServer } from '@remix-run/react';
import { handleRequest } from '@vercel/remix';
import { createEmotionServer } from '~/createEmotionServer';
import { createEmotionCache } from '~/styles/createEmotionCache';
import StylesContext from '~/styles/server.context';
import { theme } from '~/theme';
import { renderToString } from 'react-dom/server';

export default function (request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: RemixServerProps['context']) {
  const content = <Content remixContext={remixContext} request={request} />;
  return handleRequest(request, responseStatusCode, responseHeaders, content);
}

const Content = ({ request, remixContext }: { request: Request; remixContext: RemixServerProps['context'] }) => {
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  const MuiRemixServer = () => (
    <CacheProvider value={cache}>
      <CssVarsProvider defaultColorScheme='dark' defaultMode='dark' theme={theme}>
        <CssBaseline />
        <RemixServer context={remixContext} url={request.url} />
      </CssVarsProvider>
    </CacheProvider>
  );

  // Render the component to a string.
  const html = renderToString(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <StylesContext.Provider value={null}>
      <MuiRemixServer />
    </StylesContext.Provider>,
  );

  // Grab the CSS from emotion
  const emotionChunks = extractCriticalToChunks(html);

  // Re-render including the extracted css.
  return (
    <StylesContext.Provider value={emotionChunks.styles}>
      <MuiRemixServer />
    </StylesContext.Provider>
  );
};
