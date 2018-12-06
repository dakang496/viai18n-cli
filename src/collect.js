/**
 * 把分散的json文件，汇总起来
 */
const Fse = require('fs-extra');
const Path = require('path');
const helper = require('./helper');


function pathToKey(path, options) {
  return path.replace(options.fileRegx, '');
}

module.exports = function (options) {
  const data = {}

  helper.traverse(options.pageDir, options.fileRegx, function (filePath, content) {
    const relativePath = Path.relative(options.pageDir, filePath);
    const key = pathToKey(relativePath, options);
    content = JSON.parse(content);

    Object.keys(content).forEach((lang) => {
      const src = content[lang];
      const langData = data[lang] = (data[lang] || {});
      const dist = langData[key] = (langData[key] || {})
      Object.keys(src).forEach((key) => {
        dist[key] = src[key];
      });
    });
  });

  Object.keys(data).forEach((lang) => {
    const content = JSON.stringify(data[lang], null, 2);
    Fse.outputFileSync(Path.resolve(options.localeDir, lang + '.json'), content);
    Fse.outputFileSync(options.webLangDir + '/' + lang + '.json', content);
  });
}

