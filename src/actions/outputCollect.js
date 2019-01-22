/**
 * 输出📱处理后的内容
 */

const Fse = require('fs-extra');
const Path = require('path');

module.exports = async function (context, data) {
  const options = context.options;
  const locale = options.output.locale;
  if (locale) {
    await Fse.remove(locale);
    Object.keys(data).forEach((lang) => {
      const content = JSON.stringify(data[lang], null, 4);
      Fse.outputFileSync(Path.resolve(locale, lang + '.json'), content);
    });
  }

}