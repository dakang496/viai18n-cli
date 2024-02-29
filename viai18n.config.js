const axios = require("axios");
const Chinese = require('chinese-s2t')
module.exports = {
  crowdin: {
    output: "./crowdin/locales",
    argsPlaceholder: "@",
    pull: {
      client: false,
    },
    push: {
      client: true,
    },
    // Api  https://support.crowdin.com/api/v2/#section/Introduction
    async client(command, options, config, Api) {
      const projectId = config.project_id;
      const api = new Api({
        token: config.api_token
      })
      if (command === 'client') {
        console.log("client");
      } else if (command === "pull") {
        const branch = options.__branch;
        const name = branch === 'master' ? undefined : branch;

        const res = await api.sourceFilesApi.listProjectBranches(projectId, name);
        console.log(JSON.stringify(res, null, 2));
      }
    }
  },
  source: {
    pattern: ['**/*.vue', '**/*.text.js'], // glob pattern
    transform(content) {
      return Chinese.t2s(content);
    }
  },
  /** find i18n files in these folders*/
  entry: {
    pages: './example/pages/',
  },
  output: {
    html: 'static/viai18n-html',
    locale: './example/locales'
  },
  /** language setting*/
  lang: {
    base: 'zh_Hans_CN', // base language
    // target: "ko_KP",
  },
  resolve: {
    postfix: '.messages.json', // postfix of i18n file
  },
  include:{
    git:{
      baseBranch:"develop",
    }
  },
  /** filter something */
  exclude: {
    translated: {
      enable: true,
      // lang: ["en_US"],
    },
    lang: [
      "zh_Hant_HK"
    ],
    filePattern: [
      '/example/pages/exclude/*.messages.json', // glob pattern, relative path base cwd of the process
    ],
    key: [
      "key1",
      {
        file: "pages/test/*.messages.json",
        lang: ["en_US"],
        value: ['namekey1'],
      },
    ],
    text: [
      "@Not Required@",
    ],
  },
  /** translate text by your program */
  trans: {
    batch: false, // translate all at once
    /**
     * 
     * @param {*} items 
     * 
     * [{
     *  lang: "",
     *  key: "",
     *  text: "",
     * }]
     * 
     * translate text by your program and return the translated items
     * 
     * [{
     *  lang: "",
     *  key: "",
     *  text: "",
     *  value: "" // it is translated text
     * }]
     * 
     * Here's  only an example with no authorization.
     * Please dont to use to your project.
     */
    async translate(items) {
      const types = {
        en_US: "ZH_CN2EN",
        ko_KP: "ZH_CN2KR"
      }
      try {
        const untranslated = items[0];
        const response = await axios.get("http://fanyi.youdao.com/translate", {
          params: {
            doctype: "json",
            type: types[untranslated.lang] || types.en_US, // "AUTO"
            i: untranslated.text
          }
        });
        const data = response.data;
        return items.map((item) => {
          let value;
          if (data && data.errorCode === 0 && data.translateResult.length > 0) {
            value = data.translateResult[0][0].tgt;
          }
          return {
            ...item,
            value: value
          }
        })
      } catch (error) {
        console.error(error);
      }
    }
  },
  gen: {
    base: "zh_Hans_CN",
    target: "en_US", // html option
    excelFile: "./locales.xlsx", // excel option
    langs: [
      {
        name: "zh_Hans_CN",
        label: "中文",
        filled: true, // excel option
      },
      {
        name: "en_US",
        label: "English",
      },
      {
        name: "ko_KP",
        label: "한국어"
      },
    ],
  },
  collect: {
    async fetch(msg) {
      const value = msg || "Hello world";
      return {
        en_US: {
          "namekey2": value,
        }
      }
    }
  }
}