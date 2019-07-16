const axios = require("axios");
module.exports = {
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
  /** filter something */
  exclude: {
    translated: {
      enable: true,
      // lang: ["en_US"],
    },
    lang: [
      "zh_Hant_HK"
    ],
    file: [
      /exclude\.messages\.json/
    ],
    key: [
      "key1",
      {
        file: "pages/test/name.messages.json",
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
  }

}