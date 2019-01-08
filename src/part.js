/**
 * 把汇总的文件，分散到对应地方
 */
const Fse = require('fs-extra');
const Path = require('path');
const helper = require('./helper');

function optimize(options) {
  const data = {}
  const localeDir = options.output.locale;

  helper.traverse(localeDir, /.json$/, function (filePath, content) {
    content = JSON.parse(content);
    const lang = Path.basename(filePath, '.json');
    data[lang] = content;
  });

  const entry = options.entry;
  const langBase = options.lang.base;
  const langTarget = options.lang.target;
  const fileRegx = options._fileRegx;
  const partCareful = options.process.part.careful;

  Object.keys(entry).forEach((name) => {
    const dirPath = entry[name];
    helper.traverse(dirPath, fileRegx, function (filePath, content) {
      content = JSON.parse(content);
      let modified = false;

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
        const baseLangData = content[langBase];
        const distLangData = content[lang];
        Object.keys(distLangData).forEach((key) => {
          if (srcLangData[key] && distLangData[key] !== srcLangData[key]) {
            // 和基于语言文案一样，则没翻译，不修改当前语言文案
            if (baseLangData && baseLangData[key] && baseLangData[key] === srcLangData[key]) {
              return;
            }
            if (partCareful && baseLangData) {
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
      });
      if (modified) {
        Fse.outputFileSync(filePath, JSON.stringify(content, null, 4));
      }
    });
  });

}

function optimizeDuplicate(options) {
  const data = {}
  const localeDir = options.output.locale;

  helper.traverse(localeDir, /.json$/, function (filePath, content) {
    content = JSON.parse(content);
    const lang = Path.basename(filePath, '.json');

    Object.keys(content).forEach((fileKey) => {
      const srcFileData = content[fileKey];
      const srcKeys = Object.keys(srcFileData);
      if (srcKeys && srcKeys.length > 0) {
        const fileData = data[fileKey] = data[fileKey] || {};
        const langData = fileData[lang] = fileData[lang] || {};
        srcKeys.forEach((textKey) => {
          langData[textKey] = srcFileData[textKey];
        });
      }
    })
  });

  const entry = options.entry;
  const parse = options.parse;
  const keyPostfixRegx = parse.keyPostfix ? new RegExp(helper.fitRegx(parse.keyPostfix) + '$') : null;

  Object.keys(data).forEach((fileKey) => {
    let fixedFileKey = fileKey;
    if (keyPostfixRegx) {
      fixedFileKey = fileKey.replace(keyPostfixRegx, '');
    }
    /** 处理文件名包含连接符的问题 */
    let connectorRegx = parse.connector;
    if (typeof connectorRegx === 'string') {
      connectorRegx = new RegExp('([^' + connectorRegx + '])' + connectorRegx, 'g')
    }
    const splits = fixedFileKey.replace(connectorRegx,'$1@@@###').split('@@@###');
    splits[0] = entry[splits[0]];
    if (!splits[0]) {
      console.error('not exist entry', fileKey);
      return;
    }
    const filePath = splits.join(Path.sep) + parse.postfix;

    const file = helper.readFileSync(filePath);
    const source = file ? JSON.parse(file) : {};
    const update = data[fileKey];

    content = helper.merge(source, update);
    content = JSON.stringify(source, null, 4);
    Fse.outputFileSync(filePath, content);
  });
}

module.exports = function (options) {
  if (options.filter.textKeyDuplicate) {
    optimizeDuplicate(options);
  } else {
    optimize(options);
  }
}



