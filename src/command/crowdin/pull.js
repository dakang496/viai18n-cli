
const split = require("./split");
const shell = require('shelljs');
const client = require("./client");
const helper = require("../../helper");
const CrowdinApi = require('@crowdin/crowdin-api-client').default;

module.exports = async function (options) {
  const branch = options.__branch;

  if (!branch || branch === "none") {
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

  const result = /(-c|--config) (.+?) /.exec(args);
  const configPath = result ? result[2] : undefined

  const pullCrowdinOptions = crowdinOptions.pull;

  if (pullCrowdinOptions && pullCrowdinOptions.beforeSplit) {
    const config = helper.readYaml(configPath || "crowdin.yml");
    await pullCrowdinOptions.beforeSplit(options, config, CrowdinApi, shell);
  }

  await split({
    ...options,
  });

  if (pullCrowdinOptions && pullCrowdinOptions.client) {

   

    await client(options, "pull", configPath);
  }

}