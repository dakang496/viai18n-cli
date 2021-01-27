const webpack = require("webpack");
const webpackProd = require('../../../build/webpack.prod');
const merge = require('webpack-merge');

module.exports = function (options) {
  const genOptions = options.gen || {};

  const webpackConf = merge(webpackProd, {
    output: {
      path: options.output.html,
    },
    plugins: [
      new webpack.DefinePlugin({
        LANG_TARGET: JSON.stringify(genOptions.target || options.lang.target),
        LANG_BASE: JSON.stringify(genOptions.base || options.lang.base),
        PARSE_DUPLICATE: false,
        LANG_OPTIONS: JSON.stringify(genOptions.langs),
      }),
    ],
    resolve: {
      alias: {
        '@': options.output.locale,
      },
    },

  });

  webpack(webpackConf, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }
    const info = stats.toJson();
    if (stats.hasErrors()) {
      console.error(info.errors);
    }
    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

  });
}