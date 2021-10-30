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

    const adjusted = Object.keys(data).reduce((result, lang) => {
      if (actionHelper.isLangValid(options, lang)) {
        result[lang] = data[lang]
      }
      return result;
    }, {});
    await outputCollect(options, adjusted);
  } else {
    collectLocal(options);
  }
}

async function collectLocal(options) {
  const baseLang = options.lang.base;
  const langs = options.__langs;

  const translatedExclude = options.exclude.translated;
  const excludetranslated = !translatedExclude || translatedExclude.enable;
  if (excludetranslated) {
    if (langs && langs.indexOf(baseLang) === -1) {// 如果要过滤已经翻译的，必须有基础语言的数据才行
      options.__langs = langs.concat(baseLang)
    }
  }

  const controller = new Controller(options);
  controller.resolveFilter(filterProperty);

  controller.onComplete(async (context, resolveFiles) => {
    const merged = mergeFile(context, resolveFiles);
    const keys = Object.keys(merged);

    /** 处理已翻译的 */
    if (excludetranslated) {
      const excludeLangs = translatedExclude && translatedExclude.lang;
      const baseLangData = merged[baseLang];

      keys.forEach((lang) => {
        if (lang === baseLang) {
          return;
        }
        if (excludeLangs && excludeLangs.find(l => l === lang)) {
          return;
        }
        merged[lang] = actionHelper.processLangDiff(baseLangData, merged[lang], false);
      })
    };

    const adjusted = actionHelper.adjustRepeated(merged);

    const outputData = keys.reduce((data, lang) => {
      if (!langs || langs.indexOf(lang) !== -1) {
        data[lang] = adjusted[lang]
      }
      return data;
    }, {});

    await outputCollect(context.options, outputData);
  });
  await controller.start();
}