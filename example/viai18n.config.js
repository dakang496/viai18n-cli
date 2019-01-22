module.exports = {
  /** 从这些目录查询需要匹配的文件 */
  entry: {
    pages: './example/pages/',
  },
  output: {
    html: 'static/viai18n-html', // 页面资源输出目录
    locale: './example/locales' // 生成的多语言文件目录
  },
  /** 语言的相关配置 */
  lang: {
    base: 'zh_Hans_CN',
    // target: "ko_KP",
  },
  /** 解析的相关配置 */
  resolve: {
    postfix: '.messages.json', // 匹配的文件后缀
  },
  /** 过滤 */
  exclude: {
    translated: { // 是否过滤掉已经翻译过的
      enable: true,
      // lang: ["ja_JP"],
    },
    lang: [
      'lastUpdateTime',
      "zh_Hant_HK"
    ],
    file: [
      // /index\.messages\.json/
    ],
    key: [
      // "key1"
      {
        // file: "pages_test_name",
        lang: ["en_US"],
        value: ['namekey1'],
      },
    ],
    text: [
      "@Not Required@",
    ],
  },

}