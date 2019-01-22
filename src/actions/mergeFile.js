/**
 * 按照相关语言环境的内容放到同一个文件中
 */
const REPEATED_KEY = '__repeated__';
module.exports = function (context, data) {
  const result = {};
  data.forEach(item => {
    const content = item.content;
    Object.keys(content).forEach((lang) => {
      if (!result[lang]) {
        result[lang] = {};
        result[lang][REPEATED_KEY] = {};
      }
      const resultLang = result[lang];

      const langData = content[lang];
      Object.keys(langData).forEach((key) => {
        const repeated = resultLang[REPEATED_KEY];
        if (repeated[key] && repeated[key].findIndex(value => value === langData[key]) !== -1) {
          return;
        }
        if (resultLang[key]) {
          if (resultLang[key] !== langData[key]) {
            repeated[key] = [resultLang[key], langData[key]];
            delete resultLang[key];
          }
        } else {
          resultLang[key] = langData[key];
        }
      });

    })
  });
  return result;
}