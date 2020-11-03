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

    const langOptions = options.lang;
    const force = options.__force;

    /** 去掉没翻译的 */
    if (!force) {

      Object.keys(merged).forEach((lang) => {
        if (lang === langOptions.base) {
          return;
        }
        merged[lang] = actionHelper.processLangDiff(merged[langOptions.base], merged[lang], true);
      });
    }

    let adjusted = actionHelper.adjustRepeated(merged);
    const useLang = options.__useLang;
    const effectLangs = options.__effectLangs || [];
    const empty = (effectLangs.length === 0);

    if (useLang) {
      const langs = Object.keys(adjusted).filter((lang) => {
        if (lang === langOptions.base) {
          return false;
        }
        return empty || effectLangs.find((l) => {
          return l === lang
        })
      });
      if (langs.length > 0) {
        adjusted = langs.reduce(function (newAdjusted, lang) {
          if (adjusted[useLang]) {
            newAdjusted[lang] = adjusted[useLang];
          }
          return newAdjusted;
        }, {});
      }
    }
    actionHelper.fillResolveFiles(resolveFiles, adjusted, langOptions.base, empty ? langOptions.target : undefined, {
      force: force
    });
  });
  await controller.start();
}