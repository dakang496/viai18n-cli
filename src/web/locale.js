const context = require.context('@', false, /\.json$/);
const data = {}
const langOptions = LANG_OPTIONS;
context.keys().forEach((key) => {
  const lang = key.replace(/\.json$/, '').split('/').pop();
  const match = !langOptions || langOptions.find((option) => {
    return option.name === lang
  });
  if (match) {
    data[lang] = context(key);
  }
});
export default data;