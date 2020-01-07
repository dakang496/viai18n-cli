/**
 * 过滤属性
 */

const Path = require('path');
const Minimatch = require('minimatch');

function shouldFilter(filters, value, file, lang) {
  filters = filters || [];
  return filters.some((filter) => {
    if (typeof filter === 'string') {
      return filter === value;
    } else if (filter instanceof RegExp) {
      return filter.test(value);
    } else if (filter && typeof filter === 'object') {
      let status = 0;
      if (!filter.file || Minimatch(file, filter.file)) {
        status++;
      }
      if (!filter.lang || (filter.lang && Array.isArray(filter.lang) && filter.lang.indexOf(lang) !== -1)) {
        status++;
      }
      let filterValue = filter.value;
      if (filterValue) {
        if (!Array.isArray(filterValue)) {
          filterValue = [filterValue];
        }
        if (shouldFilter(filterValue, value, file, lang)) {
          status++;
        }
      }
      if (status === 3) {
        return true;
      }
    }
    return false;
  });
}

module.exports = function (context, data) {
  const options = context.options;
  const exclude = options.exclude;

  const distContent = JSON.parse(JSON.stringify(data.content));
  Object.keys(distContent).forEach((lang) => {
    // 过滤掉语言
    if ((exclude.lang || []).indexOf(lang) !== -1) {
      delete distContent[lang]
      return;
    }
    const langData = distContent[lang];
    const relativePath = Path.relative(Path.resolve(data.rootPath,'../'), data.filePath);
    Object.keys(langData).forEach((key) => {
      /**
       *  过滤掉key和文本
       */
      const filtered = shouldFilter(exclude.key, key, relativePath, lang)
        || shouldFilter(exclude.text, langData[key], relativePath, lang);
      if (filtered) {
        delete langData[key];
      }
    });
  });
  return distContent;
}