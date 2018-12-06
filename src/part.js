/**
 * 把汇总的文件，分散到对应地方
 */
const Fse = require('fs-extra');
const Path = require('path');
const helper = require('./helper');

function keyToPath(key, options) {
  return key + options.postfix;
}


module.exports = function (options) {
  const data = {}

  helper.traverse(options.localeDir, /.json$/, function (filePath, content) {
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
  })

  Object.keys(data).forEach((fileKey) => {
    const filePath = Path.resolve(options.pageDir, keyToPath(fileKey, options));
    const file = helper.readFileSync(filePath);
    const source = file ? JSON.parse(file) : {};
    const update = data[fileKey];
    helper.merge(source, update);
    const content = JSON.stringify(source, null, 2)
    Fse.outputFileSync(filePath, content);
  });

  // const str = JSON.stringify(data, null, 2)
  // console.log(str);
}



