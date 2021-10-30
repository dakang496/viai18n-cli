const Controller = require('../../controller');
const filterProperty = require('../../actions/filterProperty');

const Path = require("path");
const Fse = require('fs-extra');

module.exports = async function (options) {
  const crowdinOutput = (options.crowdin && options.crowdin.output) || "./crowdin/locales";
  const postfix = (options.resolve && options.resolve.postfix) || ".messages.json";
  const baseLang = (options.lang && options.lang.base) || "zh_Hans_CN";

  const untranslated = options.__untranslated;
  const isTranslation = options.__translation;

  const controller = new Controller(options);
  controller.resolveFilter(filterProperty);

  Fse.removeSync(Path.resolve(crowdinOutput));

  controller.onComplete(async (context, resolveFiles) => {
    const sourceFileMap = {}

    resolveFiles.forEach((fileItem) => {
      const content = adjustContent(fileItem.content, baseLang, untranslated);

      let contextPath = fileItem.entryName + Path.sep + fileItem.entryName + Path.sep + Path.relative(fileItem.rootPath, fileItem.filePath).replace(postfix, "");


      if (!isTranslation) {
        sourceFileMap[baseLang] = sourceFileMap[baseLang] || {};

        pushDataByPath(contextPath, content[baseLang], sourceFileMap[baseLang]);
      } else {
        Object.keys(content).forEach((lang) => {
          sourceFileMap[lang] = sourceFileMap[lang] || {};
          pushDataByPath(contextPath, content[lang], sourceFileMap[lang]);
        });
      }
    });

    Object.keys(sourceFileMap).forEach((lang) => {
      Object.keys(sourceFileMap[lang]).forEach((entryName) => {
        const fileName = `${entryName}/${lang}.json`;
        const filePath = Path.resolve(crowdinOutput, fileName);
        outputFile(filePath, sourceFileMap[lang][entryName]);
      })
    });
  });
  await controller.start();
}

function outputFile(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2);
    Fse.outputFileSync(filePath, content);
  } catch (error) {
    console.error(error);
  }
}

function pushDataByPath(path, data, root) {
  if (Object.keys(data).length === 0) {
    return;
  }
  const layers = path.split(Path.sep);
  let parentData = root;

  layers.forEach((layer, index) => {
    parentData[layer] = parentData[layer] || {};

    if (index >= (layers.length - 1)) {
      parentData[layer] = data;
    }
    parentData = parentData[layer];
  })
}

function adjustContent(content, baseLang, baseLangUntranslated) {
  const result = {}
  Object.keys(content).forEach((lang) => {
    if (lang === baseLang && baseLangUntranslated) {
      const baseLangData = {
        ...content[baseLang]
      };

      Object.keys(baseLangData).forEach((key) => {
        const value = baseLangData[key];

        const match = Object.keys(content).find((lang) => {
          if (lang === baseLang) {
            return false;
          }
          const langData = content[lang];
          return langData[key] !== undefined && (langData[key] === value)
        });
        if (!match) {
          delete baseLangData[key]
        }
      })
    } else {
      result[lang] = {
        ...content[lang]
      };
    }
  })
  return result;
}

