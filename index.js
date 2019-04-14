#!/usr/bin/env node

const program = require('commander');
const ora = require('ora');

const genCommand = require('./src/command/gen');
const parseConf = require('./src/parseConf');
const collectCommand = require('./src/command/collect');
const splitCommand = require('./src/command/split');
const fillCommand = require('./src/command/fill');
const changeLangCommand = require('./src/command/changeLang');
const changeKeyCommand = require('./src/command/changeKey');
const cleanCommand = require('./src/command/clean');

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
program.version(pkg.version, '-v, --version');
program.option('-c, --config [file]', 'setup profile', 'viai18n.config.js');


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
  .command('fill [useLang] [effectLangs...]')
  .description('fill with translated texts')
  .action(function (useLang, effectLangs) {
    showSpinner('fill', async function () {
      const config = parseConf(program.config);
      await fillCommand({
        ...config,
        __useLang: useLang,
        __effectLangs: effectLangs
      });
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
  .command('changeLang <oldname> <newname>')
  .description('change lang name')
  .action(function (oldname, newname, cmd) {
    showSpinner('changeLang', async function () {
      const config = parseConf(program.config);
      await changeLangCommand({
        ...config,
        oldLang: oldname,
        newLang: newname,
      });
    });
  });

program
  .command('changeKey <input> <output> [lang]')
  .description('change key name in hash')
  .action(async function (input, output, lang, cmd) {
    showSpinner('changeLang', async function () {
      await changeKeyCommand({
        lang: lang || "zh_Hans_CN",
        input: input,
        output: output,
      });
    });
  });

program
  .command('clean [regExp]')
  .description('clean invalid text which is deprecated')
  .option('-k, --key', 'remove key')
  .option('-t, --text', 'remove text')
  .action(async function (regExp, cmd) {
    showSpinner('clean', async function () {
      const config = parseConf(program.config);
      const regExpStr = regExp || "@DEPRECATED@";
      const matchWhat = (cmd.text && "text") || "key"
      await cleanCommand({
        ...config,
        __regExp: regExpStr,
        __matchWhat: matchWhat,
      });
    });
  });

program.parse(process.argv);