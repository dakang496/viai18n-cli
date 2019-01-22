const Controller = require('../controller');
const filterProperty = require('../actions/filterProperty');
const mergeFile = require('../actions/mergeFile');
const filterTranslated = require('../actions/filterTranslated');
const outputCollect = require('../actions/outputCollect');
const adjustRepeated = require('../actions/adjustRepeated');

module.exports = async function (options) {
  const controller = new Controller(options);
  controller.resolveFilter(filterProperty);

  controller.onComplete(async (context, resolveFiles) => {
    const merged = mergeFile(context, resolveFiles);
    const untranslated = filterTranslated(context, merged);
    const adjusted = adjustRepeated(context, untranslated);
    await outputCollect(context, adjusted);
  });
  controller.start();
}