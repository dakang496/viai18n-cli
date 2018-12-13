const webpack = require("webpack");
const webpackProd = require('../build/webpack.prod');
const merge = require('webpack-merge');

module.exports = function (options) {
  const webpackConf = merge(webpackProd, {
    output: {
      path: options.output.html,
    },
    plugins: [
      new webpack.DefinePlugin({
        LANG_BASE: JSON.stringify(options.lang.base),
        PARSE_DUPLICATE:JSON.stringify(options.parse.duplicate),
      }),
    ]
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