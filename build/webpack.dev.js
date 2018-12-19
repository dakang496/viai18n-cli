const merge = require('webpack-merge');
const webpack = require('webpack');
const webpackBase = require('./webpack.base');

const parseConf = require('../src/parseConf');
const options = parseConf('viai18n.config.js');

module.exports = merge(webpackBase, {
  devServer: {
    inline: true,
    hot: true, // 启用 webpack 的模块热替换特性
    open: true, // 启用 open 后，dev server 会打开浏览器
    stats: {
      colors: true
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      },
      LANG_BASE: JSON.stringify(options.lang.base),
      PARSE_DUPLICATE:JSON.stringify(options.parse.duplicate),
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
})