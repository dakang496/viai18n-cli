const Fse = require('fs-extra');
const Path = require('path');
const Minimatch = require('minimatch');
const yaml = require('js-yaml');
const fs = require('fs');

function traverse(dir, handler, match, excludePattern) {
  const stats = Fse.statSync(dir);
  if (!stats || !stats.isDirectory()) {
    return false;
  }

  const files = Fse.readdirSync(dir) || [];
  files.forEach((file) => {
    const filePath = Path.resolve(dir, file);
    const result = traverse(filePath, handler, match, excludePattern);
    if (!result) { // not directory
      let filterable = !match || !match.test(filePath) || excludePattern && excludePattern.some((pattern) => {
        return Minimatch(filePath, Path.join(process.cwd(), pattern));
      });
      if (filterable) {
        return;
      }

      const content = Fse.readFileSync(filePath, {
        encoding: 'utf8'
      });
      handler && content && handler(filePath, content);
    }
  });
  return true;
}

function traverseObj(obj, callback, keys = []) {
  if (!obj || typeof obj !== 'object') {
    return;
  }
  Object.keys(obj).forEach((key) => {
    const type = typeof obj[key];
    if (type === 'object') {
      traverseObj(obj[key], callback, keys.concat(key));
    } else {
      callback && callback(key, obj[key], obj, keys);
    }
  })
}

function extractSame(base, source) {
  const result = {}
  for (var key in source) {
    const sourceValue = source[key];
    const baseValue = base[key];
    const sourceType = typeof sourceValue;
    const baseType = typeof baseValue;
    if (sourceType === 'object' && baseType === 'object') {
      const obj = extractSame(baseValue, sourceValue);
      if (obj) {
        result[key] = obj;
      }
    } else if (sourceType === 'string' && baseType === 'string') {
      if (sourceValue === baseValue) {
        result[key] = sourceValue;
      }
    }
  }
  return Object.keys(result).length !== 0 ? result : undefined;
}

function merge(source, update) {
  if (!source || !update) {
    return source || update || {};
  }
  for (let key in update) {
    if (update.hasOwnProperty(key)) {
      if (typeof update[key] !== 'object') {
        source[key] = update[key];
      } else {
        if (typeof source[key] === 'object') {
          source[key] = merge(source[key], update[key]);
        } else {
          source[key] = update[key];
        }
      }
    }
  }
  return source;
}

function isFileExist(path) {
  try {
    Fse.accessSync(path, Fse.constants.R_OK | Fse.constants.W_OK);
  } catch (error) {
    return false;
  }
  return true;
}

function readFileSync(path) {
  if (!isFileExist(path)) {
    return null;
  }
  try {
    const content = Fse.readFileSync(path, {
      encoding: 'utf8'
    });
    return content;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function fitRegx(str) {
  return str.replace(/\./g, '\\.').replace(/\+/g, '\\+')
    .replace(/\?/g, '\\?').replace(/\*/g, '\\*')
    .replace(/\^/g, '\\^').replace(/\$/g, '\\$')
    .replace(/\|/g, '\\|');
}

function sortObjectByKey(unordered) {
  const ordered = {};
  Object.keys(unordered).sort().forEach(function (key) {
    const type = typeof unordered[key];
    if (type === 'string') {
      ordered[key] = unordered[key];
    } else if (unordered[key] && type === 'object') {
      ordered[key] = sortObjectByKey(unordered[key]);
    }
  });
  return ordered
}

function readYaml(file) {
  const absolutePath = Path.resolve(file);
  return yaml.load(fs.readFileSync(absolutePath, 'utf8'));
}

module.exports = {
  traverse: traverse,
  traverseObj: traverseObj,
  merge: merge,
  isFileExist: isFileExist,
  readFileSync: readFileSync,
  fitRegx: fitRegx,
  sortObjectByKey: sortObjectByKey,
  extractSame: extractSame,
  readYaml: readYaml
}