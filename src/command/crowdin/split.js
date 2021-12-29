const glob = require("glob")
const Path = require("path");
const Fse = require('fs-extra');
const helper = require("../../helper");

module.exports = async function (options) {
  const crowdinOutput = (options.crowdin && options.crowdin.output) || "./crowdin/locales";
  const postfix = (options.resolve && options.resolve.postfix) || ".messages.json";
  const baseLang = (options.lang && options.lang.base) || "zh_Hans_CN";
  const ignoreLangs = options.__ignoreLangs || [baseLang, "ach_UG"];
  const splitOpitons = (options.crowdin && options.crowdin.split) || {}
  const looseLangs = splitOpitons.looseLangs || ["ach_UG"];

  const localesPath = Path.resolve(crowdinOutput);

  const transFilePaths = glob.sync("**/*.json", {
    cwd: localesPath,
    ignore: ignoreLangs.map((lang) => {
      return `**/*/${lang}.json`;
    })
  });

  transFilePaths.forEach((filePath) => {
    const pathParts = filePath.split(Path.sep);
    const entryName = pathParts[0];
    const lang = Path.basename(pathParts[pathParts.length - 1], ".json");

    const entryPath = options.entry[entryName];
    if (!entryPath) {
      return;
    }

    const transData = JSON.parse(helper.readFileSync(Path.resolve(localesPath, filePath)) || null);
    if (!transData) {
      return;
    }

    const normalizedData = {};
    helper.traverseObj(transData, function (key, value, parent, keys) {
      if (!value) {
        return;
      }
      const destPath = Path.resolve(entryPath, keys.slice(1).join("/") + postfix);

      if (!normalizedData[destPath]) {
        normalizedData[destPath] = {};
      }
      if (!normalizedData[destPath][lang]) {
        normalizedData[destPath][lang] = {};
      }
      normalizedData[destPath][lang][key] = value;
    });

    Object.keys(normalizedData).forEach((path) => {
      if (!normalizedData[path]) {
        return;
      }
      const isLoose = looseLangs.indexOf(lang) !== -1;
      let destData = JSON.parse(helper.readFileSync(path) || null);
      if (!isLoose && !destData) {
        return;
      }
      destData = destData || {};

      let destLangData = destData[lang];
      if (!isLoose && !destLangData) {
        return;
      }
      destLangData = destLangData || {};

      destData[lang] = helper.sortObjectByKey({
        ...destLangData,
        ...normalizedData[path][lang]
      });
      outputFile(path, destData);
    });

  });
}

function outputFile(filePath, data) {
  try {
    const destData = JSON.stringify(data, null, 4);
    Fse.outputFileSync(filePath, destData);
  } catch (error) {
    console.error(error);
  }
}