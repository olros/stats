import { minify } from 'uglify-js';

const __FALLBACK_BASE_URL__ = '__FALLBACK_BASE_URL__';
const pageviewScript = () => {
  try {
    const host = location.host;
    const script = document.currentScript;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const isBot = Boolean(window._phantom || window.__nightmare || window.navigator.webdriver || window.Cypress);
    if (host.includes('localhost') || isBot || !script) return;

    const pathname = script.getAttribute('data-pathname') || location.pathname;
    const team = script.getAttribute('data-team');
    const project = script.getAttribute('data-project');
    const baseUrl = script.getAttribute('data-baseurl') || __FALLBACK_BASE_URL__;
    if (!team || !project) return;

    const url = `${baseUrl}/api/${team}/${project}/`;

    const event = (name: string) => navigator.sendBeacon(`${url}event/`, JSON.stringify({ name }));
    const pageview = (data: { pathname: string; referrer: string | null }) => navigator.sendBeacon(`${url}pageview/`, JSON.stringify(data));

    window.__stats = { event, pageview };

    const data = {
      pathname,
      referrer: window.document.referrer || null,
    };

    window.__stats.pageview(data);
  } catch {}
};

const pageviewScriptAsString = pageviewScript
  .toString()
  .replace(__FALLBACK_BASE_URL__, process.env.NODE_ENV === 'production' ? '"https://stats.olafros.com"' : '"http://localhost:3000"');

export const loader = async () => {
  const minifiedScript = minify(`(${pageviewScriptAsString})()`, { toplevel: true, module: true, compress: { unsafe: true } }).code;
  return new Response(minifiedScript, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': `public, max-age=${process.env.NODE_ENV === 'production' ? 2592000 : 0}`,
    },
  });
};
