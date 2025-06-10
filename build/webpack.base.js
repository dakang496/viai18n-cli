
const Path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
function resolve(dir) {
  return Path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    app: Path.resolve(__dirname, '../src/web/index.js'),
  },
  output: {
    filename: '[name].js',
    path: Path.resolve('viai18n-html'),
    // 在每次构建前清理输出目录
    clean: true, 
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src/web'), resolve('node_modules/webpack-dev-server/client')]
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'i18n.html',
      template: Path.resolve(__dirname, 'template.html'),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      inlineSource: '.(js|css)$', // 内联
    }),
    new HtmlInlineScriptPlugin(), // 启用内联插件
    
  ]
}