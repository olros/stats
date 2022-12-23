import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { CssBaseline, CssVarsProvider } from '@mui/joy';
import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { createEmotionCache } from '~/styles/createEmotionCache';
import StylesContext from '~/styles/server.context';
import { theme } from '~/theme';
import { renderToString } from 'react-dom/server';

export default function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: EntryContext) {
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
    <StylesContext.Provider value={null}>
      <MuiRemixServer />
    </StylesContext.Provider>,
  );

  // Grab the CSS from emotion
  const emotionChunks = extractCriticalToChunks(html);

  // Re-render including the extracted css.
  const markup = renderToString(
    <StylesContext.Provider value={emotionChunks.styles}>
      <MuiRemixServer />
    </StylesContext.Provider>,
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
