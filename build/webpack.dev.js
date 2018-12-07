const merge = require('webpack-merge');
const webpack = require('webpack');
const webpackBase = require('./webpack.base');

const parseConf = require('../src/parseConf');
const options = parseConf('viai18n.config.js');

module.exports = merge(webpackBase, {
  devServer: {
    clientLogLevel: 'warning',
    hot: true,
    compress: true,
    port: '9987',
    open: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      },
      LANG_BASE: JSON.stringify(options.lang.base)
    }),
  ]
})