/**
 * 输出处理后的内容
 */

const Fse = require('fs-extra');
const Path = require('path');
const actionHelper = require('./helper');

async function clearDirWithFilter(dir, filterFn) {
  Fse.mkdirpSync(dir);
  Fse.readdir(dir).then(files => {
    return Promise.all(files.filter(filterFn).map(file => Fse.remove(file)));
  });
}

module.exports = async function (options, data) {
  const locale = options.output.locale;
  if (!locale) {
    return;
  }
  await clearDirWithFilter(locale, file => {
    return (/(^|\/)\.[^\/\.]/g).test(file); // 清理目录，排除隐藏文件/文件夹
  });
  if (!options.__nokey) {
    Fse.removeSync(locale);
    
    Object.keys(data).forEach((lang) => {
      const content = JSON.stringify(data[lang], null, 4);
      Fse.outputFileSync(Path.resolve(locale, lang + '.json'), content);
    });
  } else {
    Fse.removeSync(locale);

    const regx = new RegExp(actionHelper.REPEATED_KEY);
    Object.keys(data).forEach((lang) => {
      const exist = {};
      const texts = []
      const langData = data[lang];
      Object.keys(langData).forEach((key) => {
        if (regx.test(key)) {
          return;
        }
        const text = langData[key].trim();
        if (!text || exist[text] || (/^（|）|：$/).test(text)) {
          return;
        }
        exist[text] = true;
        texts.push(text);
      })
      Fse.outputFileSync(Path.resolve(locale, lang + '.txt'), texts.join("\n\n\n"));
    })
  }
}