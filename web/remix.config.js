/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: ['d3-time-format', 'd3-color', '@nivo/colors', '@nivo/line', '@nivo/bar', '@nivo/core', '@nivo/legends'],
  serverMinify: true,
  serverModuleFormat: 'cjs',
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_routeConvention: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_headers: true,
  },
};
