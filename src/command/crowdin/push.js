
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

  const crowdinArgs = (options.__crowdinArgs || "").replace("_", "-");;
  if (branch === "master") {
    shell.exec(`crowdin upload sources ` + crowdinArgs);
  } else {
    shell.exec(`crowdin upload sources -b ${branch}` + crowdinArgs);
  }
}