
const split = require("./split");
const shell = require("shelljs");
const client = require("./client");
const helper = require("../../helper");
const CrowdinApi = require("@crowdin/crowdin-api-client").default;
const minimist = require("minimist");

module.exports = async function (options) {
  const branch = options.__branch;

  if (!branch || branch === "none") {
    return;
  }

  if (!helper.checkBranchName(options, branch)) {
    return;
  }

  const crowdinOptions = options.crowdin;

  const defaultArgs = "--export-only-approved --skip-untranslated-strings";
  const regx = new RegExp(helper.fitRegx(crowdinOptions.argsPlaceholder || ""), "ig");
  const args = (options.__crowdinArgs || "").replace(regx, "-") || defaultArgs;

  const shellCommand = branch === "master" ?
    `crowdin download ` + args :
    `crowdin download -b ${branch} ` + args;

  shell.exec(shellCommand);

  const parsed = minimist(args.split(' '));
  const configPath = parsed.c || parsed.config || "crowdin.yml";


  const pullCrowdinOptions = crowdinOptions.pull;

  if (pullCrowdinOptions && pullCrowdinOptions.beforeSplit) {
    const config = helper.readYaml(configPath);
    await pullCrowdinOptions.beforeSplit(options, config, CrowdinApi, shell, parsed);
  }

  await split({
    ...options,
  });

  if (pullCrowdinOptions && pullCrowdinOptions.client) {
    await client(options, "pull", configPath, parsed);
  }

}