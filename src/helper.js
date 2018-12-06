const Fse = require('fs-extra');
const Path = require('path');
const config = require('./config');

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

function pathToKey(path) {
  return path.replace(config.fileRegx, '');
}

function keyToPath(key) {
  return key + config.postfix;
}

function merge(source, update) {
  if (!source || !update) {
    return source || update || {};
  }
  for (let key in update) {
    if (update.hasOwnProperty(key)) {
      const type = typeof update[key];
      if (type === 'string') {
        source[key] = update[key];
      } else if (type === 'object') {
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

module.exports = {
  traverse: traverse,
  pathToKey: pathToKey,
  keyToPath: keyToPath,
  merge: merge,
  isFileExist: isFileExist,
  readFileSync: readFileSync,
}