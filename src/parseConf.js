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
    _webLocale: path.resolve(__dirname, '..', './src/web/locales'),
    parse: {
      connector: '_', // 链接符
      postfix: '.messages.json', // 匹配的文件后缀
      keyPostfix: '',
    },
    filter: {
      // translated: { // 是否过滤掉已经翻译过的
      //   enable: true,
      //   lang: [""],
      // },
      textKeyDuplicate: true,
      file: [
      ],
      textKey: [
      ],
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
      const regxStr = helper.fitRegx(postfix) + '$';
      merge._fileRegx = new RegExp(regxStr);
    }
    return merge;
  } catch (error) {
    console.error(error);
  }
  return null;
}