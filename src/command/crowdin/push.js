
const collect = require("./collect");
const shell = require('shelljs');
const client = require("./client");
const helper = require("../../helper");

module.exports = async function (options) {
  const branch = options.__branch;
  if (!branch || branch === "none") {
    return;
  }
  await collect({
    ...options,
    __untranslated: false,
    __translation: false
  });

  const crowdinOptions = options.crowdin;

  const regx = new RegExp(helper.fitRegx(crowdinOptions.argsPlaceholder || ""), "ig");
  const args = (options.__crowdinArgs || "").replace(regx, "-");

  if (branch === "master") {
    shell.exec(`crowdin upload sources ` + args);
  } else {
    shell.exec(`crowdin upload sources -b ${branch}` + args);
  }

  if (crowdinOptions.push && crowdinOptions.push.client) {

    const result = /(-c|--config) (.+?) /.exec(args);
    const path = result ? result[2] : undefined

    await client(options, "push", path);
  }

}