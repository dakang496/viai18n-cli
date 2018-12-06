const context = require.context('@/locale', false, /\.json$/);
const data = {}
context.keys().forEach((key) => {
  const lang = key.replace(/\.json$/, '').split('/').pop();
  data[lang] = context(key);
});
export default data;