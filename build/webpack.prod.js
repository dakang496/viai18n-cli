
const merge = require('webpack-merge');
const webpack = require('webpack');
const webpackBase = require('./webpack.base');

module.exports = merge(webpackBase, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
  ]
})