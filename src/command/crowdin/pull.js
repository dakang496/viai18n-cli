
const split = require("./split");
const shell = require('shelljs');

module.exports = async function (options) {
  const branch = options.__branch;

  if (!branch) {
    return;
  }
  if (branch === "master") {
    shell.exec(`crowdin download --export-only-approved --skip-untranslated-strings`);
  } else {
    shell.exec(`crowdin download -b ${branch}  --export-only-approved --skip-untranslated-strings`);
  }

  await split({
    ...options,
  });

}