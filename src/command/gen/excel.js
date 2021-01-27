const fs = require('fs');
const path = require("path");
const Excel = require('exceljs');
const actionHelper = require('../../actions/helper');


module.exports = async function (options) {
  const genOptions = options.gen || {};
  const localeData = actionHelper.readLocale(options.output.locale);
  const baseLang = genOptions.base || options.lang.base;
  if (!localeData[baseLang]) {
    console.error("no gen.base or lang.base");
    return;
  };

  const genLangOptions = options.gen && options.gen.langs;
  const langOptions = genLangOptions ? genLangOptions.filter((option) => {
    return !!localeData[option.name];
  }) : Object.keys(localeData).map((lang) => {
    return {
      name: lang,
      label: lang,
      filled: lang === baseLang
    }
  });

  const langFilleds = langOptions.reduce((result, option) => {
    if (option.filled) {
      result.push(option.name);
    }
    return result;
  }, []);

  /**
   * Workbook
   */
  const workbook = new Excel.Workbook();
  workbook.created = new Date();
  workbook.modified = new Date();
  const worksheet = workbook.addWorksheet('locales');

  /**
   * Column
   */
  const columns = langOptions.map((option) => {
    return {
      header: option.label, key: option.name, width: 40,
    }
  });
  worksheet.columns = columns;


  /**
   *  Column values
   */
  const textKeys = Object.keys(localeData[baseLang]).map((key) => {
    return key;
  });

  langOptions.forEach((option) => {
    const langData = localeData[option.name];
    const column = worksheet.getColumn(option.name);
    const values = textKeys.map((key) => {
      const text = langData[key];
      const match = langFilleds.find((lang) => {
        if (option.name === baseLang) {
          return false;
        }
        if (option.name !== lang) {
          return localeData[lang][key] === text
        }
      });
      return match ? "" : langData[key];
    });
    column.values = [option.label].concat(values);
  });

  worksheet.getRow(1).font = { size: 16, bold: true };

  const file = (options.gen && options.gen.excelFile) || "./locales.xlsx";

  return await workbook.xlsx.writeFile(path.resolve(file));
}