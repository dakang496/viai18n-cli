/**
 * 修改hash值
 */
const md5 = require("blueimp-md5");
const Fse = require('fs-extra');
const Path = require('path');
const helper = require('../helper');

function getTextKey(text) { // 8 chars text with 4 chars hash should be enough
  const textKey = text.replace(/[\s\r\n]/g, "").slice(0, 8);

  //  八个首字符+hash
  return text.length > 8 ? `${textKey}_${md5(text).slice(0, 4)}` : textKey;
}

module.exports = function (options) {
  const oldLocales = options.output.locale;
  const distDir = oldLocales + "-hash";
  const langBase = options.lang.base;

  /** 根据基础语言构建oldkey-newKey */
  const keyMap = {};
  const regxStr = helper.fitRegx(`${langBase}.json`);
  helper.traverse(oldLocales, new RegExp(regxStr), function (filePath, content) {
    content = JSON.parse(content);
    helper.traverseObj(content, function (key, value, obj) {
      if(typeof value === 'string'){
        keyMap[key] = getTextKey(value);
      }
    })
  });

  Fse.outputFileSync(distDir + '/hash.json', JSON.stringify(keyMap, null, 4));

  helper.traverse(oldLocales, /\.json/, function (filePath, content) {
    content = JSON.parse(content);
    helper.traverseObj(content, function (key, value, obj) {
      if (/DEPRECATED/.test(key)) {
        delete obj[key];
        return;
      }
      if (keyMap[key]) {
        obj[keyMap[key]] = value;
        delete obj[key];
      }
    });
    Fse.outputFileSync(distDir + '/' + Path.basename(filePath), JSON.stringify(content, null, 4));
  });
}