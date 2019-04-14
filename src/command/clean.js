/**
 * clean invalid text which is deprecated
 */
const Controller = require('../controller');
const filterProperty = require('../actions/filterProperty');
const helper = require('../helper');
const Fse = require('fs-extra');

module.exports = async function (options) {
  const controller = new Controller(options);
  controller.resolveFilter(filterProperty);
  controller.onComplete(async (context, resolveFiles) => {
    const regx = new RegExp(helper.fitRegx(options.__regExp));
    const matchWhat = options.__matchWhat;

    resolveFiles.forEach((item) => {
      const originContent = JSON.parse(JSON.stringify(item.originContent));
      let modified = false;
      helper.traverseObj(originContent, (key, value, parentObj) => {
        const matchContent = matchWhat === 'key' ? key : value;
        if (regx.test(matchContent)) {
          delete parentObj[key];
          modified = true;
        }
      });
      modified && Fse.outputFileSync(item.filePath, JSON.stringify(helper.sortObjectByKey(originContent), null, 4));
    })
  });
  await controller.start();
}
