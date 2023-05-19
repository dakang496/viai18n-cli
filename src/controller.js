const helper = require('./helper');
const shell = require('shelljs');
const Path = require('path');

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

Controller.prototype.highlight=function(text, color="green"){
  if(color === "red"){
    return "\033[31m" + text + "\033[0m";
  }
  return "\033[32m" + text + "\033[0m";
}

Controller.prototype.getIncludedFiles = function () {
  const options = this.options;
  const gitConfig = options.include && options.include.git;
  const baseBranch = gitConfig && gitConfig.baseBranch;
  if(!baseBranch){
    return null;
  }
  console.log(this.highlight(`\nOnly collect modified files based on ${baseBranch} branch!!!`, "red"));
  const postfix = options.resolve.postfix
  console.log(this.highlight("Current branch first hash:"));
  const firstHash = shell.exec(`git log ${baseBranch}..HEAD --pretty=format:%h | tail -1`).stdout.trim();
  console.log(this.highlight("\nit previous hash:"));
  const previousHash = shell.exec(`git rev-parse --short ${firstHash}^1`).stdout.trim()
  console.log(this.highlight("Modified files:"));
  const files = shell.exec(`git diff --name-only ${previousHash} -- '**/*${postfix}'`).stdout.trim().split("\n");

  return files.map((file) => {
    return Path.resolve(file);
  });
}


Controller.prototype.run = async function () {
  const entry = this.options.entry;
  const fileRegx = this.options._fileRegx;
  const filePattern = this.options.exclude.filePattern;

  const includedFiles = this.getIncludedFiles();


  Object.keys(entry).forEach((name) => {
    const rootPath = entry[name];
    helper.traverse(rootPath, (filePath, originContent) => {
      if(includedFiles && !includedFiles.includes(filePath)){
        return;
      }
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