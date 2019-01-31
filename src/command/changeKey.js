/**
 * 把已翻译的文案填充没翻译的
 */
const md5 = require("blueimp-md5");
const helper = require('../helper');
const actionHelper = require('../actions/helper');
const Fse = require('fs-extra');
const Path = require('path');

function getTextKey(text) { // 8 chars text with 4 chars hash should be enough
  const trim = text.replace(/[\s\r\n]/g, "");
  return trim.length <= 8 ? trim :
    `${trim.slice(0, 8)}_${md5(text).slice(0, 4)}`;
}
module.exports = async function (options) {
  const langBase = options.lang;
  const outputDir = Path.resolve(options.output);
  const inputDir = Path.resolve(options.input);
  const data = actionHelper.readLocale(inputDir);

  const keyMap = {};
  const baseData = data[langBase];
  helper.traverseObj(baseData, function (key, value, obj) {
    if (typeof value === 'string') {
      keyMap[key] = getTextKey(value);
    }
  });
  Fse.outputFileSync(Path.resolve(outputDir, './hash.txt'), JSON.stringify(keyMap, null, 4));


  helper.traverseObj(data, function (key, value, obj) {
    if (/DEPRECATED/.test(key)) {
      delete obj[key];
      return;
    }
    if (keyMap[key]) {
      obj[keyMap[key]] = value;
      delete obj[key];
    }
  });

  Object.keys(data).forEach((lang) => {
    Fse.outputFileSync(Path.resolve(outputDir, lang + '.json'), JSON.stringify(data[lang], null, 4));
  });

}