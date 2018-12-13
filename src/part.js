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
  const fileRegx = options._fileRegx;

  Object.keys(entry).forEach((name) => {
    const dirPath = entry[name];
    helper.traverse(dirPath, fileRegx, function (filePath, content) {
      content = JSON.parse(content);
      let modified = false;

      Object.keys(content).forEach((lang) => {
        if (langBase === lang) { // 基础语言不需要赋值
          return;
        };
        const srcLangData = data[lang];
        const distLangData = content[lang];
        Object.keys(distLangData).forEach((key) => {
          if (srcLangData[key] && distLangData[key] !== srcLangData[key]) {
            distLangData[key] = srcLangData[key];
            modified = true
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
      const fileData = data[fileKey] = data[fileKey] || {};
      const langData = fileData[lang] = fileData[lang] || {};

      const srcFileData = content[fileKey];
      Object.keys(srcFileData).forEach((textKey) => {
        langData[textKey] = srcFileData[textKey];
      });
    })
  });

  const entry = options.entry;
  const parse = options.parse;

  Object.keys(data).forEach((fileKey) => {
    const splits = fileKey.split(parse.connector);
    splits[0] = entry[splits[0]];
    if (!splits[0]) {
      console.error('not exist entry', fileKey);
      return;
    }
    const filePath = splits.join(Path.sep) + parse.postfix;

    const file = helper.readFileSync(filePath);
    const source = file ? JSON.parse(file) : {};
    const update = data[fileKey];
    helper.merge(source, update);
    const content = JSON.stringify(source, null, 4);
    Fse.outputFileSync(filePath, content);
  });
}

module.exports = function (options) {
  if (options.parse.duplicate) {
    optimizeDuplicate(options);
  } else {
    optimize(options);
  }
}



