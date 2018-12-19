
const Path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
function resolve(dir) {
  return Path.join(__dirname, '..', dir)
}

// const postcssLoader = {
//   loader: 'postcss-loader',
//   options: {
//     config: {
//       path: Path.resolve(__dirname, '..'),
//     }
//   }
// };
module.exports = {
  entry: {
    app: Path.resolve(__dirname, '../src/web/index.js'),
  },
  output: {
    filename: '[name].js',
    path: Path.resolve('viai18n-html')
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src/web'),
    },
  },
  module: {
    rules: [
      // {
      //   test: /\.vue$/,
      //   loader: 'vue-loader',
      // },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src/web'), resolve('node_modules/webpack-dev-server/client')]
      },
      // {
      //   test: /\.css$/,
      //   use: [
      //     'vue-style-loader',
      //     'css-loader',
      //     postcssLoader
      //   ],
      // },
      // {
      //   test: /\.scss$/,
      //   use: [
      //     'sass-loader',
      //     postcssLoader
      //   ]
      // },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: Path.resolve(__dirname, 'template.html'),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
  ]
}