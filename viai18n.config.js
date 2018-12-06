const postfix = '.messages.json';
module.exports = {
  outputDir:'static/viai18n-html',
  pageDir: './example/pages/',
  localeDir: './example/locales/',
  postfix: postfix,
  fileRegx: new RegExp(postfix.replace(/\./g, '\\.') + '$')
}