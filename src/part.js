/**
 * 把汇总的文件，分散到对应地方
 */
const Fse = require('fs-extra');
const Path = require('path');
const helper = require('./helper');

module.exports = function (options) {
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



