const Fse = require('fs-extra');
const lodash = require("lodash");
const path = require("path");

module.exports = class Handler {
  constructor(params) {
    this.api = params.api;
    this.projectId = params.projectId;
    this.branchName = params.branchName;
    this.excludeLangs = params.excludeLangs;
    this.output = params.output || "./crowdin/recent";
  }
  async getProject() {
    const project = await this.api.projectsGroupsApi.getProject(this.projectId);
    return project;
  }

  async init() {
    const project = await this.getProject();
    const data = project.data;

    this.targetLanguageIds = data.targetLanguageIds;
    this.sourceLanguageId = data.sourceLanguageId;
    this.sourceLanguageId = data.sourceLanguageId;

    const languageMapping = Object.keys(data.languageMapping).reduce((acc, key) => {
      acc[key] = data.languageMapping[key].locale_with_underscore;
      return acc;
    }, {});
    languageMapping[this.sourceLanguageId] = "zh_Hans_CN";
    this.languageMapping = languageMapping;
  }

  getFilesCroql(files) {
    return files.map((file) => {
      return `id of file = ${file.data.id}`;
    }).join(" or ");
  }

  async filterStringItems(stringItems, croql) {
    const eachCount = 50;

    const result = [];
    const items = [];

    stringItems.forEach((item) => {
      if (item.data.identifier.includes("\"")) {
        result.push(item);
      } else {
        items.push(item);
      }
    });

    for (let index = 0; index < items.length; index = index + eachCount) {
      const idsCroql = items.slice(index, index + eachCount).map((item) => {
        return `identifier = "${item.data.identifier}"`;
      }).join(" or ");

      const recentItems = await this.fetchStringItems({
        croql: `(${idsCroql}) and (${croql})`
      });
      result.push(...recentItems);
    }
    return result;
  }
  async fetchStringItems(params) {
    const count = 500;
    let size = 500;
    let offset = 0;
    let stringItems = [];

    while (count === size) {
      const res = await this.api.sourceStringsApi.listProjectStrings(this.projectId, {
        ...params,
        limit: count,
        offset: offset,
      });

      stringItems = stringItems.concat(res.data);

      size = res.data.length;
      offset += size;
    }
    return stringItems;
  }
  async fetchTranslationItems(languageId, params) {
    const count = 500;
    let size = 500;
    let offset = 0;
    let items = [];

    const ids = params.stringIds ? params.stringIds.split(",") : [];
    if (ids.length <= 0) {
      return [];
    }

    while (count === size) {
      if (offset > ids.length) {
        console.log("offset", offset, size, ids);
        throw new Error("Abnormal translation query");
      }

      const res = await this.api.stringTranslationsApi.listLanguageTranslations(this.projectId, languageId, {
        ...params,
        limit: count,
        offset: offset,
      });

      items = items.concat(res.data);

      size = res.data.length;
      offset += size;


    }
    return items;
  }
  async fetchBranchAllFiles() {
    if (this.branchName === "master") {
      const res = await this.api.sourceFilesApi.listProjectDirectories(this.projectId, {
        limit: 1,
        filter: "locales",
        orderBy: "createdAt asc",
      });

      if (!res.data || res.data.length === 0) {
        return [];
      }
      if (res.data && res.data.length > 0) {
        const directoryId = res.data[0].data.id;
        const filesRes = await this.api.sourceFilesApi.listProjectFiles(this.projectId, {
          recursion: 10,
          limit: 100,
          directoryId,
        });

        console.log(`\nAll files of ${this.branchName} branch:`, filesRes.data.map((item) => item.data.path));
        return filesRes.data || [];
      }
    } else {
      const branchRes = await this.api.sourceFilesApi.listProjectBranches(this.projectId, { limit: 100, name: this.branchName });

      if (!branchRes.data || branchRes.data.length === 0) {
        return [];
      }

      if (branchRes.data && branchRes.data.length > 0) {
        const branchId = branchRes.data[0].data.id;
        const filesRes = await this.api.sourceFilesApi.listProjectFiles(this.projectId, {
          recursion: 10,
          limit: 100,
          branchId,
        });

        console.log(`\nAll files of ${this.branchName} branch:`, filesRes.data.map((item) => item.data.path));
        return filesRes.data || [];
      }
    }
  }

  async cleanBranchHiddenStrings(branch) {
    if (!branch) {
      return;
    }
    const items = await this.fetchStringItems({
      croql: `is hidden and name of branch = "${branch}"`,
    });

    console.log(`\nAll hidden strings under branch ${branch}:`, items.map((item) => item.data.text));

    if (items.length > 0) {
      const body = items.map((item) => {
        return {
          op: "remove",
          path: `/${item.data.id}`,
        };
      });

      await this.api.sourceStringsApi.stringBatchOperations(this.projectId, body);
    }
    console.log("Cleanup finished");
  }


  async handleRecentTranslations(files, updatedTime, options = {}) {
    const filesCroql = this.getFilesCroql(files);
    const rencentCroql = `count of translations where ( ( updated > '${new Date(updatedTime).toISOString()}' or ( count of approvals where ( added > '${new Date(updatedTime).toISOString()}' ) >0 ) ) and ( (language != @language:"zh-TW" and count of approvals > 0) or (language = @language:"zh-TW") )) > 0`;

    const onlyMaster = !!options.onlyMaster;
    let filteredStringItems = [];
    if (!onlyMaster) {
      // 获取所有最近更新的
      const stringItems = await this.fetchStringItems({
        croql: rencentCroql,
      });
      console.log(`There are ${stringItems.length} recently updated translation strings`);
      if (stringItems.length <= 0) {
        return;
      }

      // 必须是当前分支内的
      filteredStringItems = await this.filterStringItems(stringItems, filesCroql);
      console.log(`There are ${filteredStringItems.length} recently updated in the current branch`);
      if (filteredStringItems.length <= 0) {
        return;
      }
    } else {
      filteredStringItems = await this.fetchStringItems({
        croql: `${rencentCroql} and (${filesCroql})`,
      });
      console.log(`There are ${filteredStringItems.length} recently updated in the current branch`);
      if (filteredStringItems.length <= 0) {
        return;
      }
    }

    const filteredStringMap = filteredStringItems.reduce((acc, item) => {
      acc[item.data.id] = item;
      return acc;
    }, {});

    // 处理目标语言
    const languageMapping = this.languageMapping;
    const targetLanguageIds = this.targetLanguageIds.filter(lang => languageMapping[lang] && !this.excludeLangs.includes(languageMapping[lang]));

    if (targetLanguageIds.length <= 0) {
      return;
    }

    Fse.removeSync(path.resolve(this.output, "./locales"));

    for (let index = 0; index < targetLanguageIds.length; index++) {
      const language = targetLanguageIds[index];
      const serviceLang = languageMapping[language];

      console.log(`Getting translations for ${serviceLang}`);
      const translationItems = await this.fetchTranslationItems(language, {
        stringIds: Object.keys(filteredStringMap).join(","),
      });

      const result = {};
      translationItems.forEach(item => {
        const stringItem = filteredStringMap[item.data.stringId];
        if (stringItem) {
          const translation = item.data.text;

          const paths = stringItem.data.context.split(" -> ");
          lodash.set(result, paths, translation);
        }
      });

      // 输出翻译文件
      Object.keys(result).forEach(key => {
        const filePath = path.resolve(this.output, `./locales/${key}/${serviceLang}.json`);

        Fse.outputFileSync(filePath, JSON.stringify({
          [key]: result[key]
        }, null, 2));
      });
      console.log(`Finished processing translations for ${serviceLang}`);
    }
    return true;
  }
}