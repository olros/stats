/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: 'vercel',
  server: process.env.NODE_ENV === 'development' ? undefined : './server.js',
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: ['react-charts', 'd3-time-format'],
};
