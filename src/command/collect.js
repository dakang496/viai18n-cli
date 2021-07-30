const Controller = require('../controller');
const filterProperty = require('../actions/filterProperty');
const mergeFile = require('../actions/mergeFile');
const outputCollect = require('../actions/outputCollect');
const actionHelper = require('../actions/helper');

module.exports = async function (options) {
  const arguments = options.__arguments;
  const collectOptions = options.collect || {};

  if (arguments && arguments[0] && collectOptions.fetch) {
    const data = await collectOptions.fetch.apply(null, arguments);
    await outputCollect(options, data);
  } else {
    collectLocal(options);
  }
}

async function collectLocal(options) {
  const controller = new Controller(options);
  controller.resolveFilter(filterProperty);

  controller.onComplete(async (context, resolveFiles) => {
    const merged = mergeFile(context, resolveFiles);

    /** 处理已翻译的 */
    const baseLang = options.lang.base;
    const translatedExclude = options.exclude.translated;
    if (!translatedExclude || translatedExclude.enable) {
      const langs = translatedExclude && translatedExclude.lang;
      const baseLangData = merged[baseLang];

      Object.keys(merged).forEach((lang) => {
        if (lang === baseLang) {
          return;
        }
        if (langs && langs.find(l => l === lang)) {
          return;
        }
        merged[lang] = actionHelper.processLangDiff(baseLangData, merged[lang], false);
      })
    };
    const adjusted = actionHelper.adjustRepeated(merged);
    await outputCollect(context.options, adjusted);
  });
  await controller.start();
}