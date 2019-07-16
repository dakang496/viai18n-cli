
const collectCommad = require("./collect");
const splitCommad = require("./split");
const helper = require("../helper");
const actionHelper = require('../actions/helper');
const outputCollect = require('../actions/outputCollect');

module.exports = async function (options) {
  const newOptions = helper.merge({}, options);
  newOptions.exclude = newOptions.exclude || {};
  newOptions.exclude.translated = newOptions.exclude.translated || {}
  newOptions.exclude.translated.enable = true
  await collectCommad(newOptions);
  await translate(newOptions);
  await splitCommad(newOptions);
}

async function translate(options) {
  const data = actionHelper.readLocale(options.output.locale);
  const trans = options.trans;
  const untranslatedItems = normativeItems(data);
  if (trans.batch) {
    await handleTrans(options, untranslatedItems, data)
  } else {
    for (let i = 0; i < untranslatedItems.length; i++) {
      await handleTrans(options, [untranslatedItems[i]], data)
    }
  }
  await outputCollect(options, data);
}

async function handleTrans(options, untranslatedItems, data) {
  const translate = options.trans && options.trans.translate;
  if (typeof translate !== 'function') {
    return;
  }
  let translatedItems = await translate(untranslatedItems);
  if (!translatedItems) {
    return;
  }
  if (translatedItems && !Array.isArray(translatedItems)) {
    translatedItems = [translatedItems]
  }
  translatedItems.forEach((item) => {
    if (item.value !== undefined && data[item.lang] && data[item.lang][item.key] !== undefined) {
      data[item.lang][item.key] = item.value;
    }
  })
}

function normativeItems(data = {}) {
  const items = [];
  Object.keys(data).forEach((lang) => {
    const langData = data[lang];
    Object.keys(langData).forEach((key) => {
      items.push({
        lang: lang,
        key: key,
        text: langData[key]
      })
    })
  })
  return items;
}