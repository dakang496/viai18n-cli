const helper = require("../helper");
const Path = require('path');
const Fse = require('fs-extra');

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

/**
 * 处理两个语言文案的差异
 * @param {*} baseLangData 
 * @param {*} distLangData 
 * @param {*} onlyDiff 只保留差异或者只保留相同
 */
function processLangDiff(baseLangData, distLangData, onlyDiff) {
  const result = {};
  const repeated = distLangData[REPEATED_KEY];
  if (repeated) {
    result[REPEATED_KEY] = {};
    Object.keys(repeated).forEach((key) => {
      const texts = repeated[key];
      const newTexts = texts.filter((text) => {
        const exist = equal(key, text, baseLangData);
        return onlyDiff ? !exist : exist;
      });
      result[REPEATED_KEY][key] = newTexts;
    });
  };

  Object.keys(distLangData).forEach((key) => {
    if (key === REPEATED_KEY) {
      return;
    }
    const exist = equal(key, distLangData[key], baseLangData);
    const shouldAdd = onlyDiff ? !exist : exist;
    if (shouldAdd) {
      result[key] = distLangData[key];
    }
  });
  return result;
}

function paddingTranslated(baseLangData, distLangData, translatedData, options) {
  let modified = false;
  Object.keys(distLangData).forEach((key) => {
    if(options && options.force){
      distLangData[key] = translatedData[key];
      modified = true
    }else{
      if (!translatedData[key] || translatedData[key] === baseLangData[key] || translatedData[key] === distLangData[key]) {
        return;
      }
      if (!baseLangData[key] || baseLangData[key] === distLangData[key]) {
        distLangData[key] = translatedData[key];
        modified = true
      }
    }
  });
  return modified;
}

function fillResolveFiles(resolveFiles, translatedData, langBase, langTarget, options) {
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
      const srcLangData = translatedData[lang];
      if (!srcLangData) { // 没有该语言数据
        return;
      }
      const modified = paddingTranslated(content[langBase], content[lang], srcLangData, options);
      if (modified) {
        shouldUpdate = true;
        Object.assign(originContent[lang], content[lang]);
      }
    });
    if (shouldUpdate) {
      Fse.outputFileSync(item.filePath, JSON.stringify(helper.sortObjectByKey(originContent), null, 4));
    }
  });
}

function adjustRepeated(data) {
  data = JSON.parse(JSON.stringify(data)); // dont modify origin

  Object.keys(data).forEach((lang) => {
    const langData = data[lang];
    const repeated = langData[REPEATED_KEY];
    Object.keys(repeated).forEach((key) => {
      repeated[key].forEach((text, index) => {
        langData[index === 0 ? key : (key + REPEATED_KEY + index)] = text;
      });
    });
    delete langData[REPEATED_KEY];
  });
  return data;
}

function readLocale(dir) {
  const data = {};
  helper.traverse(dir, function (filePath, content) {
    content = JSON.parse(content);
    const lang = Path.basename(filePath, '.json');
    data[lang] = Object.assign({}, data[lang], content);
  }, /.json$/);
  return data;
}


module.exports = {
  processLangDiff: processLangDiff,
  paddingTranslated: paddingTranslated,
  fillResolveFiles: fillResolveFiles,
  adjustRepeated: adjustRepeated,
  readLocale: readLocale,
  REPEATED_KEY: REPEATED_KEY
}