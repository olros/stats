/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [
    /^@nivo\/.*/,
    /^@react-spring\/.*/,
    /^d3-.*/,
    'delaunator',
    'internmap',
    'react-lifecycles-compat',
    '@olros/stats',
    /^remix-utils.*/,
    'is-ip',
    'ip-regex',
    'super-regex',
    'clone-regexp',
    'function-timeout',
    'time-span',
    'convert-hrtime',
    'is-regexp',
  ],
  serverMinify: true,
  serverModuleFormat: 'cjs',
};
