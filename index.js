#!/usr/bin/env node

const program = require('commander');

const genCommand = require('./src/command/gen');
const devCommand = require('./src/command/dev');
const parseConf = require('./src/parseConf');
const collectCommand = require('./src/command/collect');
const splitCommand = require('./src/command/split');

const changeLang = require('./src/utils/changeLang');
const changeHash = require('./src/utils/changeHash');

const pkg = require('./package.json');
program.version(pkg.version);
program.option('-c, --config [file]', 'setup profile', 'viai18n.config.js');
program.option('-l, --langs [items]', 'modify lang name', function (val) {
  return val.split(',');
}, []);

program
  .command('split')
  .description('split locales')
  .action(function () {
    console.log('split');
    const config = parseConf(program.config);
    splitCommand(config);
  });

program
  .command('collect')
  .description('collect locales together')
  .action(function () {
    console.log('collect');
    const config = parseConf(program.config);
    collectCommand(config)
  });

program
  .command('gen')
  .description('generate html for editing')
  .action(function () {
    console.log('generate');
    const config = parseConf(program.config);
    genCommand(config);
  });

program
  .command('dev')
  .description('develop')
  .action(function () {
    console.log('dev');
    const config = parseConf(program.config);
    devCommand(config);
  });

program
  .command('start')
  .description('collect and generate')
  .action(async function () {
    console.log('start');
    const config = parseConf(program.config);
    await collectCommand(config);
    await genCommand(config);
  });

program
  .command('changeLang')
  .description('change lang name')
  .action(function () {
    if (program.langs.length < 2) {
      console.error('need two arguments。eg: oldLang,newLang');
      return;
    }
    console.log('changeLang');

    const config = parseConf(program.config);
    changeLang({
      ...config,
      oldLang: program.langs[0],
      newLang: program.langs[1],
    });
  });

  program
  .command('changeHash')
  .description('change hash')
  .action(function () {
    console.log('changeHash');

    const config = parseConf(program.config);
    changeHash({
      ...config,
    });
  });

program.parse(process.argv);