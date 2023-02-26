/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: 'vercel',
  server: process.env.NODE_ENV === 'development' ? undefined : './server.js',
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: ['d3-time-format'],
  serverMinify: true,
  future: {
    unstable_cssSideEffectImports: true,
    v2_errorBoundary: true,
    unstable_postcss: true,
  },
};
