#!/usr/bin/env node

const program = require('commander');
const ora = require('ora');

const genCommand = require('./src/command/gen');
const parseConf = require('./src/parseConf');
const collectCommand = require('./src/command/collect');
const splitCommand = require('./src/command/split');
const paddingCommand = require('./src/command/padding');

const changeLang = require('./src/utils/changeLang');
const changeHash = require('./src/utils/changeHash');

async function showSpinner(text, callback) {
  const spinner = ora(text);
  spinner.start();
  try {
    await callback();
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw error;
  }
}

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
    showSpinner('split', async function () {
      const config = parseConf(program.config);
      await splitCommand(config);
    });
  });

program
  .command('collect')
  .description('collect locales together')
  .action(function () {
    showSpinner('collect', async function () {
      const config = parseConf(program.config);
      await collectCommand(config);
    });
  });

program
  .command('gen')
  .description('generate html for editing')
  .action(function () {
    showSpinner('generate', async function () {
      const config = parseConf(program.config);
      await genCommand(config);
    });
  });

program
  .command('padding')
  .description('padding untranslated texts with translated texts')
  .action(function () {
    showSpinner('padding', async function () {
      const config = parseConf(program.config);
      await paddingCommand(config);
    });
  });

program
  .command('start')
  .description('collect and generate')
  .action(async function () {
    showSpinner('start', async function () {
      const config = parseConf(program.config);
      await collectCommand(config);
      await genCommand(config);
    });
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