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
const transCommand = require('./src/command/trans');

const crowdinCollectCommand = require('./src/command/crowdin/collect');
const crowdinSplitCommand = require('./src/command/crowdin/split');

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

const createEntry = function (paths) {
  return paths ? paths.reduce((entry, path, index) => {
    entry[index] = path;
    return entry;
  }, {}) : undefined;
}


program
  .command('split')
  .description('split locales')
  .option('-f, --force', 'split forcedly even if it has translated')
  .addOption(new program.Option('-p, --paths <paths...>', 'paths of entry'))
  .action(function (options) {
    showSpinner('split', async function () {
      const entry = createEntry(options.paths);
      const overrides = entry ? { entry: entry } : undefined;

      const opts = program.opts();
      const config = parseConf(opts.config, overrides);

      await splitCommand({
        ...config,
        __force: options.force,
      });
    });
  });

program
  .command('collect')
  .option('-n, --nokey', 'remove key')
  .option('-u, --untranslated', 'collect untranslated in your project')
  .addOption(new program.Option('-p, --paths <paths...>', 'paths of entry'))
  .addOption(new program.Option('-l, --langs <langs...>', 'valid languages'))
  .addOption(new program.Option('-a, --arguments <arguments...>', 'arguments of your program'))

  .description('collect locales together')
  .action(function (options) {
    const opts = program.opts();
    showSpinner('collect', async function () {
      const entry = createEntry(options.paths);
      const overrides = entry ? { entry: entry } : undefined;

      const merges = options.untranslated ? {
        exclude: {
          translated: {
            enable: true
          }
        }
      } : undefined;

      const config = parseConf(opts.config, overrides, merges);

      await collectCommand({
        ...config,
        __nokey: options.nokey,
        __arguments: options.arguments,
        __langs: options.langs
      });
    });
  });
program
  .command('c-collect')
  .option('-u, --untranslated', 'collect untranslated in your project')
  .option('-t, --translation', 'collect translation in your project')
  .description('collect locales together for crowdin')
  .action(function (options) {
    const opts = program.opts();
    showSpinner('c-collect', async function () {
      const config = parseConf(opts.config);

      await crowdinCollectCommand({
        ...config,
        __untranslated: options.untranslated,
        __translation: options.translation,
      });
    });
  });
program.command("c-split")
  .description('split locales')
  .action(function () {
    showSpinner('c-split', async function () {
      const opts = program.opts();
      const config = parseConf(opts.config);

      await crowdinSplitCommand({
        ...config,
      });
    });
  })
program
  .command('gen')
  .description('generate html or excel for translating')
  .addOption(new program.Option('-t, --type [type]', 'type of output', 'html').choices(['html', 'excel']))
  .action(function (options) {
    showSpinner('generate', async function () {
      const opts = program.opts();
      const config = parseConf(opts.config);

      await genCommand({
        ...config,
        __outputType: options.type
      });
    });
  });

program
  .command('fill [useLang] [effectLangs...]')
  .description('fill with translated texts')
  .option('-f, --force', 'fill forcedly even if it has translated')
  .option('-b, --baseLang', 'determine whether it is translated')
  .addOption(new program.Option('-p, --paths <paths...>', 'paths of entry'))
  .action(function (useLang, effectLangs, options) {
    const opts = program.opts();

    showSpinner('fill', async function () {
      const entry = createEntry(options.paths);
      const overrides = entry ? { entry: entry } : undefined;
      const config = parseConf(opts.config, overrides);
      await fillCommand({
        ...config,
        __useLang: useLang,
        __effectLangs: effectLangs,
        __force: options.force,
        __baseLang: options.baseLang
      });
    });
  });

program
  .command('start')
  .description('collect and generate')
  .action(async function () {
    showSpinner('start', async function () {
      const opts = program.opts();
      const config = parseConf(opts.config);
      await collectCommand(config);
      await genCommand(config);
    });
  });

program
  .command('changeLang <oldname> [newname]')
  .description('change or remove lang name')
  .action(function (oldname, newname) {
    showSpinner('changeLang', async function () {
      const opts = program.opts();
      const config = parseConf(opts.config);
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
  .action(async function (input, output, lang) {
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
  .action(async function (regExp, options) {
    showSpinner('clean', async function () {
      const opts = program.opts();
      const config = parseConf(opts.config);
      const regExpStr = regExp || "@DEPRECATED@";
      const matchWhat = (options.text && "text") || "key"
      await cleanCommand({
        ...config,
        __regExp: regExpStr,
        __matchWhat: matchWhat,
      });
    });
  });

program
  .command('trans')
  .addOption(new program.Option('-p, --paths <paths...>', 'paths of entry'))
  .addOption(new program.Option('-a, --arguments <arguments...>', 'arguments of your program'))
  .description('translate collected texts by your program')
  .action(function (options) {
    showSpinner('trans', async function () {
      const entry = createEntry(options.paths);
      const overrides = entry ? { entry: entry } : undefined;
      const opts = program.opts();
      const config = parseConf(opts.config, overrides);
      await transCommand({
        ...config,
        __arguments: options.arguments,
      });
    });
  });

program.parse(process.argv);