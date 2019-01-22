const Controller = require('../controller');
const filterProperty = require('../actions/filterProperty');
const helper = require('../helper');
const Path = require('path');
const Fse = require('fs-extra');

module.exports = async function (options) {
  const data = {};
  const localeDir = options.output.locale;
  helper.traverse(localeDir, function (filePath, content) {
    content = JSON.parse(content);
    const lang = Path.basename(filePath, '.json');
    data[lang] = Object.assign({}, data[lang], content);
  }, /.json$/);
  const langBase = options.lang.base;
  const langTarget = options.lang.target;

  const controller = new Controller(options);
  controller.resolveFilter(filterProperty);
  controller.onComplete(async (context, resolveFiles) => {

    resolveFiles.forEach((item) => {
      const originContent = item.originContent;
      const content = item.content;
      let shouldUpdate = false;
      Object.keys(content).forEach((lang) => {
        if (langBase === lang) { // 基础语言不需要赋值
          return;
        };
        if (langTarget && lang !== langTarget) { // 目标语言存在，当前语言不是目标语言
          return;
        }
        const srcLangData = data[lang];
        if (!srcLangData) { // 没有该语言数据
          return;
        }
        let modified = false;
        const baseLangData = content[langBase];
        const distLangData = content[lang];
        Object.keys(distLangData).forEach((key) => {
          if (srcLangData[key] && distLangData[key] !== srcLangData[key]) {
            // 和基于语言文案一样，则没翻译，不修改当前语言文案
            if (baseLangData && baseLangData[key] && baseLangData[key] === srcLangData[key]) {
              return;
            }
            if (baseLangData) {
              // 目标语言的文案和基础语言一样才需要修改
              if (baseLangData[key] && baseLangData[key] === distLangData[key]) {
                distLangData[key] = srcLangData[key];
                modified = true
              }
            } else {
              distLangData[key] = srcLangData[key];
              modified = true
            }
          }
        });

        if (modified) {
          shouldUpdate = true;
          Object.assign(originContent[lang], distLangData);
        }
      });
      if (shouldUpdate) {
        Fse.outputFileSync(item.filePath, JSON.stringify(helper.sortObjectByKey(originContent), null, 4));
      }
    });
  });
  controller.start();
}