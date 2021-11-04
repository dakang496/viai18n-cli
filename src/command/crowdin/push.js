
const collect = require("./collect");
const shell = require('shelljs');

module.exports = async function (options) {
  const branch = options.__branch;
  if (!branch) {
    return;
  }
  await collect({
    ...options,
    __untranslated: false,
    __translation: false
  });

  if (branch === "master") {
    shell.exec(`crowdin upload sources`);
  } else {
    shell.exec(`crowdin upload sources -b ${branch}`);
  }
}