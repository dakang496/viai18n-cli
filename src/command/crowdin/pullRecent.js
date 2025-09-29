const split = require("./split");
const helper = require("../../helper");
const fse = require('fs-extra');
const path = require('path');
const lodash = require("lodash");
const CrowdinApi = require('@crowdin/crowdin-api-client').default;
const Handler = require("./Handler");
module.exports = async function (options) {
  const branch = options.__branch;

  if (!branch || branch === "none") {
    return;
  }
  if (!helper.checkBranchName(options, branch)) {
    return;
  }

  console.log("Current branch：", branch);
  console.time("Execution time");

  const crowdinConfig = helper.getCrowdinConfig(options, options.__crowdinArgs);
  const crowdinOptions = options.crowdin;
  const pullRecentOptions = crowdinOptions?.pullRecent || {};
  const recentOutput = (pullRecentOptions?.output) || "./crowdin/recent";
  const infoPath = path.resolve(recentOutput, "info.json");
  const info = fse.readJsonSync(infoPath, { throws: false });

  const api = new CrowdinApi({
    token: crowdinConfig.api_token,
  });

  const handler = new Handler({
    api,
    projectId: crowdinConfig.project_id,
    branchName: branch,
    excludeLangs: pullRecentOptions?.excludeLangs || [],
    output: recentOutput,
  });

  await handler.init();

  const files = await handler.fetchBranchAllFiles();

  let updatedTime = Date.now() - 8 * 24 * 60 * 60 * 1000;
  if (info?.branch === branch && info?.updatedTime) {
    updatedTime = info?.updatedTime;
  }

  console.log("Last update time:", new Date(updatedTime));
  const modified = await handler.handleRecentTranslations(files, updatedTime, {
    onlyMaster: options.__master
  });

  if (modified) {
    lodash.set(options, "crowdin.output", path.resolve(recentOutput, "./locales"));
    console.log("Translations synchronized to project");

    await split({
      ...options,
    });
  }

  const newInfo = {
    ...info,
    branch: branch,
    updatedTime: Date.now(),
  }
  fse.outputJsonSync(infoPath, newInfo, { spaces: 2 });

  console.timeEnd("Execution time");
}