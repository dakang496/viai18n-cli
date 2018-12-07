#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const path = require('path');

const part = require('./src/part');
const collect = require('./src/collect');
const gen = require('./src/gen');
const parseConf = require('./src/parseConf');

program.version('0.1.0');
program.option('-c, --config [file]', 'setup profile', 'viai18n.config.js');

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
  .command('start')
  .description('collect and generate')
  .action(function () {
    console.log('start');
    const config = parseConf(program.config);
    collect(config);
    gen(config);
  });
program.parse(process.argv);