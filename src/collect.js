/**
 * 把分散的json文件，汇总起来
 */
const Fse = require('fs-extra');
const Path = require('path');
const helper = require('./helper');
const config = require('./config');
const data = {}

helper.traverse(config.pageDir, config.fileRegx, function (filePath, content) {
  const relativePath = Path.relative(config.pageDir, filePath);
  const key = helper.pathToKey(relativePath);
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
  const content = JSON.stringify(data[lang], null, 2)
  Fse.outputFileSync(config.localeDir + '/' + lang + '.json', content);
  Fse.outputFileSync(config.webLangDir + '/' + lang + '.json', content);
});



