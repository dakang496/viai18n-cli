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

}