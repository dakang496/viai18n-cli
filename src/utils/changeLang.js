/**
 * 修改语言名称
 */
const Fse = require('fs-extra');
const helper = require('../helper');
module.exports = function (options) {
  if (!options.oldLang || !options.newLang) {
    console.error('need oldLang or newLang');
    return;
  }

  const entry = options.entry;
  const fileRegx = options._fileRegx;

  Object.keys(entry).forEach((name) => {
    const dirPath = entry[name];
    helper.traverse(dirPath, fileRegx, function (filePath, content) {
      content = JSON.parse(content);
      const value = content[options.oldLang];
      if (!value) {
        console.warn(`${filePath}: not exist ${options.oldLang}`);
        return;
      }
      content[options.newLang] = value;
      delete content[options.oldLang];
      const sorted = helper.sortObjectByKey(content);
      Fse.outputFileSync(filePath, JSON.stringify(sorted, null, 4));
    });
  })
}