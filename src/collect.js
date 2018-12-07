/**
 * 把分散的json文件，汇总起来
 */
const Fse = require('fs-extra');
const Path = require('path');
const helper = require('./helper');


module.exports = function (options) {
  const data = {}
  const entry = options.entry;
  const fileRegx = options.fileRegx;
  const langExclude = options.lang.exclude || [];

  Object.keys(entry).forEach((name) => {
    const dirPath = entry[name];
    helper.traverse(dirPath, fileRegx, function (filePath, content) {
      const relativePath = Path.relative(dirPath, filePath);
      const key = name + '/' + relativePath.replace(fileRegx, '');

      content = JSON.parse(content);
      Object.keys(content).forEach((lang) => {
        // 无效的语言
        if (langExclude.indexOf(lang) !== -1) {
          return;
        }
        const src = content[lang];
        const langData = data[lang] = (data[lang] || {});
        const dist = langData[key] = (langData[key] || {})
        Object.keys(src).forEach((key) => {
          dist[key] = src[key];
        });
      });
    });
  });

  Object.keys(data).forEach((lang) => {
    const content = JSON.stringify(data[lang], null, 4);
    if (options.output.locale) {
      Fse.outputFileSync(Path.resolve(options.output.locale, lang + '.json'), content);
    }
    Fse.outputFileSync(Path.resolve(__dirname, '..', options.webLocale, lang + '.json'), content);
  });
}

