#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const path = require('path');

const part = require('./src/part');
const collect = require('./src/collect');
const gen = require('./src/gen');
const dev = require('./src/dev');
const parseConf = require('./src/parseConf');

const changeLang = require('./src/utils/changeLang');
const changeHash = require('./src/utils/changeHash');

program.version('0.1.0');
program.option('-c, --config [file]', 'setup profile', 'viai18n.config.js');
program.option('-l, --langs <items>', 'modify lang name', function (val) {
  return val.split(',');
}, []);

program
  .command('part')
  .description('part locales')
  .action(function () {
    console.log('part');
    const config = parseConf(program.config);
    part(config);
  });

program
  .command('collect')
  .description('collect locales together')
  .action(function () {
    console.log('collect');
    const config = parseConf(program.config);
    collect(config);
  });

program
  .command('gen')
  .description('generate html for editing')
  .action(function () {
    console.log('generate');
    const config = parseConf(program.config);
    gen(config);
  });

program
  .command('dev')
  .description('develop')
  .action(function () {
    console.log('dev');
    const config = parseConf(program.config);
    dev(config);
  });

program
  .command('start')
  .description('collect and generate')
  .action(function () {
    console.log('start');
    const config = parseConf(program.config);
    collect(config);
    gen(config);
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