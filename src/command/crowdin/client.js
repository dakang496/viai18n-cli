const CrowdinApi = require('@crowdin/crowdin-api-client').default;
const shell = require('shelljs');
const helper = require("../../helper");

module.exports = async function (options, command, configPath, ...params) {
  try {
    const clientFn = options.crowdin && options.crowdin.client;

    if (clientFn) {
      const config = helper.readYaml(configPath || "crowdin.yml");

      await clientFn.apply(null, [command || "client", options, config, CrowdinApi, shell].concat(params));
    }

  } catch (error) {
    console.error(error);
  }
}