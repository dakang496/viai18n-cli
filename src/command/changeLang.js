/**
 * 把已翻译的文案填充没翻译的
 */
const Controller = require('../controller');
const helper = require('../helper');
const Fse = require('fs-extra');

module.exports = async function (options) {
  if (!options.oldLang || !options.newLang) {
    console.error('incorrect arguments');
    return;
  }
  const controller = new Controller(options);
  controller.onComplete(async (context, resolveFiles) => {
    resolveFiles.forEach((item) => {
      const originContent = item.originContent;
      const value = originContent[options.oldLang];
      if (!value) {
        console.warn(`${item.filePath}: not exist ${options.oldLang}`);
        return;
      }
      originContent[options.newLang] = value;
      delete originContent[options.oldLang];
      const sorted = helper.sortObjectByKey(originContent);
      Fse.outputFileSync(item.filePath, JSON.stringify(sorted, null, 4));
    });
  });
  await controller.start();
}