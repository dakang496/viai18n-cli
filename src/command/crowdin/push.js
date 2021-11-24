
const collect = require("./collect");
const shell = require('shelljs');
const client = require("./client");

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

  const crowdinArgs = (options.__crowdinArgs || "").replace(/_/gi,"-");
  if (branch === "master") {
    shell.exec(`crowdin upload sources ` + crowdinArgs);
  } else {
    shell.exec(`crowdin upload sources -b ${branch}` + crowdinArgs);
  }

  await client(options, "push");
}