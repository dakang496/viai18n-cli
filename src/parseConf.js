const path = require('path');
const defaults = {
  postfix: '.messages.json',
  entry: { //json文件来源目录
    pages: './pages/',
  },
  output: {
    html: 'static/viai18n-html',
    locale: './locales/',
  },
  lang: {
    base: 'zh_Hans_CN',
    exclude: []
  },
  webLocale: './src/web/locale',
}
module.exports = function (filename) {
  try {
    const custom = filename ? require(path.resolve(filename)) : {};
    const merge = Object.assign({}, defaults, custom);

    const entry = merge.entry;
    Object.keys(entry).forEach((key) => {
      entry[key] = path.resolve(entry[key]);
    });

    const output = merge.output;
    Object.keys(output).forEach((key) => {
      output[key] = path.resolve(output[key]);
    });

    if (merge.postfix) {
      merge.fileRegx = new RegExp(merge.postfix.replace(/\./g, '\\.') + '$');
    }
    return merge;
  } catch (error) {
    console.error(error);
  }
  return null;
}