/**
 * 读取locales文件
 */
const helper = require('../helper');
const Path = require('path');

module.exports = function (options) {
  const data = {};
  const localeDir = options.output.locale;
  helper.traverse(localeDir, function (filePath, content) {
    content = JSON.parse(content);
    const lang = Path.basename(filePath, '.json');
    data[lang] = Object.assign({}, data[lang], content);
  }, /.json$/);
  return data;
}