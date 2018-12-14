const Fse = require('fs-extra');
const Path = require('path');

function traverse(dir, match, handler) {
  const stats = Fse.statSync(dir)
  if (!stats || !stats.isDirectory()) { // 是否文件夹
    return;
  }
  const files = Fse.readdirSync(dir) || [];
  files.forEach((file) => {
    const filePath = Path.resolve(dir, file);
    if (match.test(file)) {
      const content = Fse.readFileSync(filePath, {
        encoding: 'utf8'
      });
      handler && content && handler(filePath, content);
    } else {
      traverse(filePath, match, handler);
    }
  });
}

function merge(source, update) {
  if (!source || !update) {
    return source || update || {};
  }
  for (let key in update) {
    if (update.hasOwnProperty(key)) {
      const type = typeof update[key];
      if (type !== 'object') {
        source[key] = update[key];
      } else {
        source[key] = merge(source[key], update[key]);
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
    .replace(/\^/g, '\\^').replace(/\$/g, '\\$');
}

module.exports = {
  traverse: traverse,
  merge: merge,
  isFileExist: isFileExist,
  readFileSync: readFileSync,
  fitRegx: fitRegx,
}