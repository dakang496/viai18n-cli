const shell = require('shelljs');
const Handler = require("./Handler");
const helper = require("../../helper");
const CrowdinApi = require('@crowdin/crowdin-api-client').default;

module.exports = async function (options) {
  const branch = options.__branch;
  if (branch === "master") {
    console.warn("Clean hidden strings in 'master' branch is not supported.");
    return;
  }

  const crowdinConfig = helper.getCrowdinConfig(options, options.__crowdinArgs);
  const api = new CrowdinApi({
    token: crowdinConfig.api_token,
  });
  const handler = new Handler({
    api,
    projectId: crowdinConfig.project_id,
    branchName: branch,
  });

  await handler.cleanBranchHiddenStrings(branch);
}