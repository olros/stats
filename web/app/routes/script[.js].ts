import UglifyJS from 'uglify-js';

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
    const baseUrl = script.getAttribute('data-baseurl') || (process.env.NODE_ENV === 'production' ? 'https://stats.olafros.com' : 'http://localhost:3000');
    if (!team || !project) return;

    const data = {
      pathname,
      screen_width: window.innerWidth,
    };

    fetch(`${baseUrl}/api/` + team + '/' + project + '/pageview/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      mode: 'no-cors',
      credentials: 'omit',
    });
  } catch {}
};

const pageviewScriptAsString = pageviewScript.toString();

export const loader = async () => {
  const minifiedScript = UglifyJS.minify(`(${pageviewScriptAsString})()`, { toplevel: true, module: true, compress: { unsafe: true } }).code;

  return new Response(minifiedScript, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': `public, max-age=${process.env.NODE_ENV === 'production' ? 2592000 : 0}`,
    },
  });
};
