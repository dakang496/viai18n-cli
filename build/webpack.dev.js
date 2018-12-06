const merge = require('webpack-merge');
const webpack = require('webpack');
const webpackBase = require('./webpack.base');

module.exports = merge(webpackBase, {
  devServer: {
    clientLogLevel: 'warning',
    hot: true,
    // contentBase: path.join(__dirname, 'dist'),
    compress: true,
    // host: 'localhost',
    port: '9987',
    open: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
  ]
})