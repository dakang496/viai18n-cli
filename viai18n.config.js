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
    exclude: [
      'lastUpdateTime'
    ]
  },
  /** 解析的相关配置 */
  parse: {
    connector: '_', // 连接符
    postfix: '.messages.json', // 匹配的文件后缀
    duplicate: false // 同名的key是否保留
  }
}