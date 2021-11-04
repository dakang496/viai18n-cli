const Controller = require('../controller');
const filterProperty = require('../actions/filterProperty');
const actionHelper = require('../actions/helper');

module.exports = async function (options) {
  const lang = options.lang;
  const data = actionHelper.readLocale(options.output.locale);
  const controller = new Controller(options);
  controller.resolveFilter(filterProperty);
  controller.onComplete(async (context, resolveFiles) => {
    actionHelper.fillResolveFiles(resolveFiles, data, lang.base, lang.target, {
      force: options.__force
    });
  });
  controller.start();
}