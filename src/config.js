const postfix = '.messages.json';
module.exports = {
  pageDir: './example/pages/',
  localeDir: './example/locales/',
  webLangDir:'./src/web/locale',
  postfix: postfix,
  fileRegx: new RegExp(postfix.replace(/\./g, '\\.') + '$')
}