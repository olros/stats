/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [
    'd3-time-format',
    'd3-color',
    '@nivo/colors',
    '@nivo/line',
    '@nivo/bar',
    '@nivo/core',
    '@nivo/legends',
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
