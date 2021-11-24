
const split = require("./split");
const shell = require('shelljs');
const client = require("./client");

module.exports = async function (options) {
  const branch = options.__branch;

  if (!branch) {
    return;
  }
  const crowdinArgs = (options.__crowdinArgs || "").replace(/_/gi, "-");
  const defaultArgs = "--export-only-approved --skip-untranslated-strings";
  if (branch === "master") {
    shell.exec(`crowdin download ` + (crowdinArgs || defaultArgs));
  } else {
    shell.exec(`crowdin download -b ${branch} ` + (crowdinArgs || defaultArgs));
  }

  await split({
    ...options,
  });

  await client(options, "pull");

}