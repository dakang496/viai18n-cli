/**
 * 输出📱处理后的内容
 */

const Fse = require('fs-extra');
const Path = require('path');
const actionHelper = require('./helper');

module.exports = async function (context, data) {
  const options = context.options;
  const locale = options.output.locale;
  if (!locale) {
    return;
  }
  await Fse.remove(locale);
  if (!options.__nokey) {
    Object.keys(data).forEach((lang) => {
      const content = JSON.stringify(data[lang], null, 4);
      Fse.outputFileSync(Path.resolve(locale, lang + '.json'), content);
    });
  } else {
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