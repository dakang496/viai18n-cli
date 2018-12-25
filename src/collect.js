/**
 * 把分散的json文件，汇总起来
 */
const Fse = require('fs-extra');
const Path = require('path');
const helper = require('./helper');

/**
 * 是否需要过滤文件
 */
function isFilterFile(filters, filePath) {
  filters = filters || [];
  return filters.some((filter) => {
    return filter.test(filePath);
  })
}

/**
 * 是否需要过滤文本
 */
function isFilterTextKey(filters, textKey, file, lang) {
  filters = filters || [];
  return filters.some((filter) => {
    if (typeof filter === 'string') {
      return filter === textKey;
    } else if (filter instanceof RegExp) {
      return filter.test(textKey);
    } else if (filter && typeof filter === 'object') {
      let status = 0;
      if (!filter.file || filter.file === file) {
        status++;
      }
      if (!filter.lang || (filter.lang && Array.isArray(filter.lang) && filter.lang.indexOf(lang) !== -1)) {
        status++;
      }
      let filterKey = filter.key;
      if (filterKey) {
        if (!Array.isArray(filterKey)) {
          filterKey = [filterKey];
        }
        if (isFilterTextKey(filterKey, textKey, file, lang)) {
          status++;
        }
      }
      if (status === 3) {
        return true;
      }
    }
    return false;
  })
}

function optimize(data, options) {
  const entry = options.entry;
  const fileRegx = options._fileRegx;
  const langExclude = options.lang.exclude || [];

  Object.keys(entry).forEach((name) => {
    const dirPath = entry[name];
    helper.traverse(dirPath, fileRegx, function (filePath, content) {
      if (isFilterFile(options.filter.file, filePath)) {
        return;
      }

      const relativePath = Path.relative(dirPath, filePath);
      const fileKey = buildFileKey(name, relativePath, options);

      content = JSON.parse(content);
      Object.keys(content).forEach((lang) => {
        // 无效的语言
        if (langExclude.indexOf(lang) !== -1) {
          return;
        }
        const src = content[lang];
        Object.keys(src).forEach((key) => {
          if (!isFilterTextKey(options.filter.textKey, key, fileKey, lang)) {
            const langData = data[lang] = (data[lang] || {});
            langData[key] = src[key];
          }
        });
      })
    });
  });
  return data;
}

function buildFileKey(name, relativePath, options) {
  const parse = options.parse;
  const noSuffix = relativePath.replace(options._fileRegx, ''); // 去掉后缀
  return name + parse.connector + noSuffix.split(Path.sep).join(parse.connector) + (parse.keyPostfix || '');
}

function optimizeDuplicate(data, options) {
  const entry = options.entry;
  const fileRegx = options._fileRegx;
  const langExclude = options.lang.exclude || [];

  Object.keys(entry).forEach((name) => {
    const dirPath = entry[name];
    helper.traverse(dirPath, fileRegx, function (filePath, content) {
      if (isFilterFile(options.filter.file, filePath)) {
        return;
      }

      content = JSON.parse(content);

      const relativePath = Path.relative(dirPath, filePath);

      const fileKey = buildFileKey(name, relativePath, options);

      Object.keys(content).forEach((lang) => {
        // 无效的语言
        if (langExclude.indexOf(lang) !== -1) {
          return;
        }
        const src = content[lang];

        Object.keys(src).forEach((key) => {
          if (!isFilterTextKey(options.filter.textKey, key, fileKey, lang)) {
            const langData = data[lang] = (data[lang] || {});
            const dist = langData[fileKey] = (langData[fileKey] || {});
            dist[key] = src[key];
          }
        });
      });

    });
  });

  return data;
}


module.exports = function (options) {
  let data = {}
  if (options.filter.textKeyDuplicate) {
    optimizeDuplicate(data, options);
  } else {
    optimize(data, options);
  }

  /**
   * 过滤掉已经翻译过的
   */
  if (options.filter.translated) {
    const temp = {};
    const baseLang = options.lang.base;
    Object.keys(data).forEach((lang) => {
      const item = helper.extractSame(data[baseLang], data[lang]);
      item && (temp[lang] = item);
    });
    data = temp;
  }

  Object.keys(data).forEach((lang) => {
    const content = JSON.stringify(data[lang], null, 4);
    if (options.output.locale) {
      Fse.outputFileSync(Path.resolve(options.output.locale, lang + '.json'), content);
    }
    Fse.outputFileSync(Path.resolve(__dirname, '..', options._webLocale, lang + '.json'), content);
  });
}

