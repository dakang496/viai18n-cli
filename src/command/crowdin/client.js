const CrowdinApi = require('@crowdin/crowdin-api-client').default;
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

module.exports = async function (options, command, ...params) {
  try {
    const clientFn = options.crowdin && options.crowdin.client;

    if (clientFn) {
      const configPath = path.resolve("crowdin.yml");
      const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

      await clientFn.apply(null, [command || "client", options, config, CrowdinApi].concat(params));
    }

  } catch (error) {
    console.error(error);
  }
}