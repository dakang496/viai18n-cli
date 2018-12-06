// const webpack = require("webpack");
// const webpackProd = require('./webpack.prod');
// // const webpackDev = require('./webpack.dev');

// webpack(webpackProd, (err, stats) => {
//   if (err || stats.hasErrors()) {
//     // 在这里处理错误
//     console.error("出错啦");
//   }
//   // 处理完成
//   // console.log("成功");
// });
const gen = require('../src/gen');
gen();