const webpack = require("webpack");
const webpackProd = require('../build/webpack.prod');
const path = require('path');

module.exports = function (options) {
  if (options) {
    const outputDir = options.outputDir || 'viai18n-html'
    webpackProd.output.path = path.resolve(outputDir);
  }
  webpack(webpackProd, (err, stats) => {
    if (err || stats.hasErrors()) {
      // 在这里处理错误
      console.error("出错啦");
    }
    // 处理完成
    // console.log("成功");
  });
}