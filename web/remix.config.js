/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: ['d3-time-format'],
  serverMinify: true,
  future: {
    unstable_cssSideEffectImports: true,
    v2_errorBoundary: true,
    unstable_postcss: true,
    unstable_cssModules: true,
    unstable_tailwind: true,
    unstable_vanillaExtract: true,
    v2_routeConvention: true,
  },
};
