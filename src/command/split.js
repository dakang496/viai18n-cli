const Controller = require('../controller');
const filterProperty = require('../actions/filterProperty');
const readLocale = require('../actions/readLocale');
const actionHelper = require('../actions/helper');

module.exports = async function (options) {
  const lang = options.lang;
  const data = readLocale(options);
  const controller = new Controller(options);
  controller.resolveFilter(filterProperty);
  controller.onComplete(async (context, resolveFiles) => {
    actionHelper.paddingResolveFiles(resolveFiles, data, lang.base, lang.target);
  });
  controller.start();
}