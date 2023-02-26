import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { CssBaseline, CssVarsProvider } from '@mui/joy';
import type { EntryContext, Headers } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { createEmotionCache } from '~/styles/createEmotionCache';
import StylesContext from '~/styles/server.context';
import { theme } from '~/theme';
import isbot from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { renderToString } from 'react-dom/server';
import { PassThrough } from 'stream';

const ABORT_DELAY = 5000;

export default function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: EntryContext) {
  // If the request is from a bot, we want to wait for the full
  // response to render before sending it to the client. This
  // ensures that bots can see the full page content.
  if (isbot(request.headers.get('user-agent'))) {
    return serveTheBots(request, responseStatusCode, responseHeaders, remixContext);
  }

  return serveBrowsers(request, responseStatusCode, responseHeaders, remixContext);
}

const Content = ({ request, remixContext }: { request: Request; remixContext: EntryContext }) => {
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
  return (
    <StylesContext.Provider value={emotionChunks.styles}>
      <MuiRemixServer />
    </StylesContext.Provider>
  );
};

function serveTheBots(request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: EntryContext) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(<Content remixContext={remixContext} request={request} />, {
      // Use onAllReady to wait for the entire document to be ready
      onAllReady() {
        responseHeaders.set('Content-Type', 'text/html');
        const body = new PassThrough();
        pipe(body);
        resolve(
          new Response(body, {
            status: responseStatusCode,
            headers: responseHeaders,
          }),
        );
      },
      onShellError(err: unknown) {
        reject(err);
      },
    });
    setTimeout(abort, ABORT_DELAY);
  });
}

function serveBrowsers(request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: EntryContext) {
  return new Promise((resolve, reject) => {
    let didError = false;
    const { pipe, abort } = renderToPipeableStream(<Content remixContext={remixContext} request={request} />, {
      // use onShellReady to wait until a suspense boundary is triggered
      onShellReady() {
        responseHeaders.set('Content-Type', 'text/html');
        const body = new PassThrough();
        pipe(body);
        resolve(
          new Response(body, {
            status: didError ? 500 : responseStatusCode,
            headers: responseHeaders,
          }),
        );
      },
      onShellError(err: unknown) {
        reject(err);
      },
      onError(err: unknown) {
        didError = true;
        console.error(err);
      },
    });
    setTimeout(abort, ABORT_DELAY);
  });
}
