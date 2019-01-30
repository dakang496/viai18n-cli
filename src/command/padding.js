/**
 * 把已翻译的文案填充没翻译的
 */
const Controller = require('../controller');
const filterProperty = require('../actions/filterProperty');
const mergeFile = require('../actions/mergeFile');
const actionHelper = require('../actions/helper');

module.exports = async function (options) {
  const controller = new Controller(options);
  controller.resolveFilter(filterProperty);
  controller.onComplete(async (context, resolveFiles) => {
    const merged = mergeFile(context, resolveFiles);

    /** 去掉没翻译的 */
    const langOptions = options.lang;
    Object.keys(merged).forEach((lang) => {
      if (lang === langOptions.base) {
        return;
      }
      merged[lang] = actionHelper.processLangDiff(merged[langOptions.base], merged[lang], true);
    });
    const adjusted = actionHelper.adjustRepeated(merged);
    actionHelper.paddingResolveFiles(resolveFiles, adjusted, langOptions.base, langOptions.target);
  });
  await controller.start();
}