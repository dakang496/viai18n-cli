const { merge } = require('webpack-merge');
const webpack = require('webpack');
const webpackBase = require('./webpack.base');

const parseConf = require('../src/parseConf');
const options = parseConf('./viai18n.config.js');

module.exports = merge(webpackBase, {
  mode: 'development',
  devServer: {
    // 使用 static 替代原来的 contentBase
    static: {
      directory: options.output.html
    },
    // openPage 被替换为 open 的 page 选项
    open: {
      app: {
        name: 'chrome' // 可根据需要修改浏览器名称
      },
      target: 'i18n.html'
    },
    // inline 选项默认启用，无需显式设置
    // hot 选项默认启用，无需显式设置
    // 启用客户端错误覆盖
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    // 统计信息配置
    // stats: {
    //   colors: true
    // }
  },
  resolve: {
    alias: {
      '@': options.output.locale,
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      },
      LANG_BASE: JSON.stringify(options.lang.base),
      LANG_TARGET: JSON.stringify(options.lang.target),
      PARSE_DUPLICATE: false,
      LANG_OPTIONS: JSON.stringify(options.lang.langs),
    }),
  ]
});