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
      // target: "en_US",
    },
    /** 解析的相关配置 */
    resolve: {
      postfix: '.messages.json', // 匹配的文件后缀
    },
    /** 排除的 */
    exclude: {
      translated: { // 是否过滤掉已经翻译过的
        enable: true,
        // lang: ["ja_JP"],
      },
      lang: [
        'lastUpdateTime',
        "zh_Hant_HK"
      ],
      file: [
        // /^index.messages.json/
      ],
      key: [
        // {
        //   file: "pages_test_name",
        //   lang: ["en_US"],
        //   value: ['namekey1'],
        // },
      ],
      text: [
        "@Not Required@"
      ]
    },
  }
};
module.exports = function (filename) {
  let custom = {};
  try {
    const p = path.resolve(filename);
    custom = helper.isFileExist(p) ? require(p) : {};
  } catch (error) {
    
    console.error(error);
  }
  try {
    const merge = helper.merge(createDefaults(), custom);
    const entry = merge.entry;
    Object.keys(entry).forEach((key) => {
      entry[key] = path.resolve(entry[key]);
    });

    const output = merge.output;
    Object.keys(output).forEach((key) => {
      output[key] = path.resolve(output[key]);
    });

    const postfix = merge.resolve && merge.resolve.postfix;
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