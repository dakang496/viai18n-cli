const helper = require('./helper');

function Controller(options) {
  this.options = options;
  this.resolveHooks = [];
  this.completeHooks = [];

  this.resolveFilters = [];
  this.resolveFiles = [];
}

Controller.prototype.onResolved = function (callback) {
  this.resolveHooks.push(callback);
}
Controller.prototype.onComplete = function (callback) {
  this.completeHooks.push(callback);
}

Controller.prototype.resolveFilter = function (filter) {
  this.resolveFilters.push(filter);
}


Controller.prototype.runBefore = function () {
}

Controller.prototype.runAfter = function () {
}

Controller.prototype.start = async function () {
  this.runBefore();
  await this.run();
  this.runAfter();
}

Controller.prototype.run = async function () {
  const entry = this.options.entry;
  const fileRegx = this.options._fileRegx;
  const filePattern = this.options.exclude.filePattern;


  Object.keys(entry).forEach((name) => {
    const rootPath = entry[name];
    helper.traverse(rootPath, (filePath, originContent) => {
      originContent = JSON.parse(originContent);
      let content = originContent
      this.resolveFilters.forEach((filter) => {
        if (content) {
          content = filter(this, {
            content: content,
            originContent: originContent,
            filePath: filePath,
            rootPath: rootPath,
            entryName: name
          });
        }
      });
      if (content) {
        const data = {
          originContent: originContent,
          content: content,
          filePath: filePath,
          rootPath: rootPath,
          entryName: name
        }
        this.resolveHooks.forEach((resolve) => {
          resolve(this, data);
        });
        this.resolveFiles.push(data);
      }
    }, fileRegx, filePattern);
  });

  for (let i = 0; i < this.completeHooks.length; i++) {
    await this.completeHooks[i](this, this.resolveFiles);
  }
}
module.exports = Controller;