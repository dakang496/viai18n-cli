module.exports = {
  /** 匹配的文件后缀 */
  postfix: '.messages.json',
  /** 从这些目录查询需要匹配的文件 */
  entry: {
    pages: './example/pages/'
  },
  output: {
    html: 'static/viai18n-html', // 页面资源输出目录
    locale: './example/locales' // 生成的多语言文件目录
  },
  lang: {
    base: 'zh_Hans_CN',
    exclude: [
      'lastUpdateTime'
    ]
  }

}