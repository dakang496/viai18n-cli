const webpack = require("webpack");
const webpackDev = require('../build/webpack.dev');
const merge = require('webpack-merge');
const webpackDevServer = require('webpack-dev-server');

module.exports = function (options) {
  const webpackConf = merge(webpackDev, {
    output: {
      path: options.output.html,
    },
    plugins: [
      new webpack.DefinePlugin({
        LANG_BASE: JSON.stringify(options.lang.base),
        PARSE_DUPLICATE:JSON.stringify(options.filter.textKeyDuplicate),
      }),
    ]
  });

  const devServerOptions = Object.assign({}, webpackConf.devServer);
  const compiler = webpack(webpackConf);
  
  console.log(JSON.stringify(devServerOptions));
  const server = new webpackDevServer(compiler, devServerOptions);
  server.listen(9987, '127.0.0.1', () => {
    console.log('Starting server on http://localhost:9987');
  });
}