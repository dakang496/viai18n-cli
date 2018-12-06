#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const path = require('path');

const part = require('./src/part');
const collect = require('./src/collect');
const gen = require('./src/gen');

function parseConfig(filename) {
  const config = require(path.resolve(filename));
  return {
    ...config,
    pageDir: path.resolve(config.pageDir),
    localeDir: path.resolve(config.localeDir),
    webLangDir:'./src/web/locale',
  }
}

program.version('0.1.0');
program.option('-c, --config [file]', 'setup profile', 'viai18n.config.js');

program
  .command('part')
  .description('part locales')
  .action(function () {
    console.log('分散');
    const config = parseConfig(program.config);
    part(config);
  });

program
  .command('collect')
  .description('collect locales together')
  .action(function () {
    console.log('收集');
    const config = parseConfig(program.config);
    collect(config);
  });

program
  .command('gen')
  .description('generate html for editing')
  .action(function () {
    console.log('generate');
    const config = parseConfig(program.config);
    gen(config);
  });
program
  .command('start')
  .description('collect and generate')
  .action(function () {
    console.log('start');
    const config = parseConfig(program.config);
    collect(config);
    gen(config);
    console.log('end');
  });
program.parse(process.argv);