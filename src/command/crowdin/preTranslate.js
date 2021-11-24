const shell = require('shelljs');

module.exports = async function (options) {
  const branch = options.__branch;
  const command = options.__command;
  const method = options.__method || "tm"
  if (!command || !branch) {
    return;
  }

  const defaultArgs = "--method " + method;
  const crowdinArgs = (options.__crowdinArgs || defaultArgs).replace(/_/gi,"-");

  if (branch === "master") {
    shell.exec(`crowdin pre-translate ` + crowdinArgs);
  } else {
    shell.exec(`crowdin pre-translate -b ${branch} ` + crowdinArgs);
  }
}