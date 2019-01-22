/**
 * 过滤掉已经翻译过的
 */

const REPEATED_KEY = '__repeated__';

function equal(key, value, compare) {
  if (compare[key]) {
    return compare[key] === value
  } else {
    const texts = compare[REPEATED_KEY][key] || []
    const v = !!texts.find(v => v === value);
    return v
  }
}


module.exports = function (context, merged) {
  const options = context.options;
  const baseLang = options.lang.base;
  const translated = options.exclude.translated;
  if (translated && !translated.enable) {
    return merged;
  }
  const langs = translated && translated.lang;

  merged = JSON.parse(JSON.stringify(merged)); // dont modify origin
  const baseLangData = merged[baseLang];

  Object.keys(merged).forEach((lang) => {
    if (lang === baseLang) {
      return;
    }
    if (langs && langs.find(l => l === lang) === -1) {
      return;
    }

    const langData = merged[lang];
    Object.keys(langData).forEach((key) => {
      if (key === REPEATED_KEY) {
        Object.keys(langData[REPEATED_KEY]).forEach((k) => {
          const texts = langData[REPEATED_KEY][k];
          const newTexts = texts.filter((text) => {
            return equal(k, text, baseLangData);
          });
          langData[REPEATED_KEY][k] = newTexts;
        });
      } else {
        if (!equal(key, langData[key], baseLangData)) {
          delete langData[key]
        };
      }
    });
  });
  return merged;
}