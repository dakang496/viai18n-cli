const shell = require('shelljs');

module.exports = async function (options) {
  const branch = options.__branch;
  if (!branch) {
    shell.exec(`crowdin status`);
  } else {
    shell.exec(`crowdin status -b ${branch}`);
  }
}