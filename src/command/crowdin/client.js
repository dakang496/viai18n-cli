const CrowdinApi = require('@crowdin/crowdin-api-client').default;
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

module.exports = async function (options, command, configPath, ...params) {
  try {
    const clientFn = options.crowdin && options.crowdin.client;

    if (clientFn) {
      const absolutePath = path.resolve(configPath || "crowdin.yml");
      const config = yaml.load(fs.readFileSync(absolutePath, 'utf8'));

      await clientFn.apply(null, [command || "client", options, config, CrowdinApi].concat(params));
    }

  } catch (error) {
    console.error(error);
  }
}