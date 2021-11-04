const collect = require("./collect");
const shell = require('shelljs');

module.exports = async function (options) {
  const branch = options.__branch;
  const command = options.__command;
  if (!command || !branch) {
    return;
  }
  if (command === "branch-add") {
    shell.exec(`crowdin branch add ${branch}`);
  } else if (command === "branch-delete") {
    shell.exec(`crowdin branch delete ${branch}`);
  }
}