const Fse = require('fs-extra');
const helper = require('./helper');
// const content = Fse.readFileSync('/Users/dakang/Documents/work/projects/coinex/viai18n-cli/a.txt', {
//   encoding: 'utf8'
// });
// console.log('content', content);

const exist = helper.isFileExist('/Users/dakang/Documents/work/projects/coinex/viai18n-cli/package.json');
console.log(exist);