const path = require('path');
const helper = require('./helper');
function createDefaults() {
  return {
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
    _webLocale: './src/web/locale',
    parse: {
      connector: '_', // 链接符
      postfix: '.messages.json', // 匹配的文件后缀
    }
  }
};
module.exports = function (filename) {
  try {
    const custom = filename ? require(path.resolve(filename)) : {};
    const merge = helper.merge(createDefaults(), custom);

    const entry = merge.entry;
    Object.keys(entry).forEach((key) => {
      entry[key] = path.resolve(entry[key]);
    });

    const output = merge.output;
    Object.keys(output).forEach((key) => {
      output[key] = path.resolve(output[key]);
    });

    const postfix = merge.parse && merge.parse.postfix;
    if (postfix) {
      merge._fileRegx = new RegExp(postfix.replace(/\./g, '\\.') + '$');
    }
    return merge;
  } catch (error) {
    console.error(error);
  }
  return null;
}