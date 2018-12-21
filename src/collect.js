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
function isFilterTextKey(filters, textKey) {
  filters = filters || [];
  return filters.some((filter) => {
    if (typeof filter === 'string') {
      return filter === textKey;
    }
    return filter.test(textKey);
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
        return
      }

      content = JSON.parse(content);
      Object.keys(content).forEach((lang) => {
        // 无效的语言
        if (langExclude.indexOf(lang) !== -1) {
          return;
        }
        const src = content[lang];
        const langData = data[lang] = (data[lang] || {});
        Object.keys(src).forEach((key) => {
          if (!isFilterTextKey(options.filter.textKey, key)) {
            langData[key] = src[key];
          }
        });
      })
    });
  });
  return data;
}

function optimizeDuplicate(data, options) {
  const entry = options.entry;
  const fileRegx = options._fileRegx;
  const langExclude = options.lang.exclude || [];
  const parse = options.parse;

  Object.keys(entry).forEach((name) => {
    const dirPath = entry[name];
    helper.traverse(dirPath, fileRegx, function (filePath, content) {
      if (isFilterFile(options.filter.file, filePath)) {
        return
      }

      content = JSON.parse(content);

      const relativePath = Path.relative(dirPath, filePath);

      // 构造key
      const noSuffix = relativePath.replace(fileRegx, ''); // 去掉后缀
      const langKey = name + parse.connector + noSuffix.split(Path.sep).join(parse.connector) + (parse.keyPostfix || '');

      Object.keys(content).forEach((lang) => {
        // 无效的语言
        if (langExclude.indexOf(lang) !== -1) {
          return;
        }
        const src = content[lang];
        const langData = data[lang] = (data[lang] || {});
        const dist = langData[langKey] = (langData[langKey] || {})
        Object.keys(src).forEach((key) => {
          if (!isFilterTextKey(options.filter.textKey, key)) {
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
      temp[lang] = helper.extractSame(data[baseLang], data[lang]);
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

