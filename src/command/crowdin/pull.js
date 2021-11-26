
const split = require("./split");
const shell = require('shelljs');
const client = require("./client");
const helper = require("../../helper");

module.exports = async function (options) {
  const branch = options.__branch;

  if (!branch) {
    return;
  }
  const crowdinOptions = options.crowdin;

  const defaultArgs = "--export-only-approved --skip-untranslated-strings";
  const regx = new RegExp(helper.fitRegx(crowdinOptions.argsPlaceholder || ""), "ig");
  const args = (options.__crowdinArgs || "").replace(regx, "-") || defaultArgs;

  if (branch === "master") {
    shell.exec(`crowdin download ` + args);
  } else {
    shell.exec(`crowdin download -b ${branch} ` + args);
  }

  await split({
    ...options,
  });

  if (crowdinOptions.pull && crowdinOptions.pull.client) {

    const result = /(-c|--config) (.+?) /.exec(args);
    const path = result ? result[2] : undefined

    await client(options, "pull", path);
  }

}