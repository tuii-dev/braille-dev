const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  swcMinify: false,
  experimental: {
    instrumentationHook: true,
    // this includes files from the monorepo base two directories up
    outputFileTracingRoot: path.join(__dirname, "../../"),
    // turbotrace: {
    //   // control the log level of the turbotrace, default is `error`
    //   logLevel: "info",
    //   // control if the log of turbotrace should contain the details of the analysis, default is `false`
    //   logDetail: true,
    //   // show all log messages without limit
    //   // turbotrace only show 1 log message for each categories by default
    //   logAll: true,
    //   // control the context directory of the turbotrace
    //   // files outside of the context directory will not be traced
    //   // set the `experimental.outputFileTracingRoot` has the same effect
    //   // if the `experimental.outputFileTracingRoot` and this option are both set, the `experimental.turbotrace.contextDirectory` will be used
    //   contextDirectory: path.join(__dirname, "../../"),
    //   // if there is `process.cwd()` expression in your code, you can set this option to tell `turbotrace` the value of `process.cwd()` while tracing.
    //   // for example the require(process.cwd() + '/package.json') will be traced as require('/path/to/cwd/package.json')
    //   // processCwd?: string
    //   // control the maximum memory usage of the `turbotrace`, in `MB`, default is `6000`.
    //   // memoryLimit?: number
    // },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }
    config.resolve.alias.canvas = false;
    config.resolve.alias.handlebars = "handlebars/dist/handlebars.js";
    return config;
  },
};

module.exports = nextConfig;
