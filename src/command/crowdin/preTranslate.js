const shell = require('shelljs');
const helper = require("../../helper");

module.exports = async function (options) {
  const branch = options.__branch;
  const command = options.__command;
  const method = options.__method || "tm"
  if (!command || !branch) {
    return;
  }

  const crowdinOptions = options.crowdin;

  const regx = new RegExp(helper.fitRegx(crowdinOptions.argsPlaceholder || ""), "ig");
  const args = (options.__crowdinArgs || "").replace(regx, "-") ||  ("--method " + method);



  if (branch === "master") {
    shell.exec(`crowdin pre-translate ` + args);
  } else {
    shell.exec(`crowdin pre-translate -b ${branch} ` + args);
  }
}