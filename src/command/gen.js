const genHtml = require("./gen/html");
const genExcel = require("./gen/excel");

module.exports = async function (options) {
  const outputType = options.__outputType;

  if (outputType === "excel") {
    await genExcel(options);
  } else {
    genHtml(options);
  }
}