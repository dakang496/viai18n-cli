const shell = require('shelljs');
const helper = require("../../helper");

module.exports = async function (options) {
  const branch = options.__branch;
  const method = options.__method || "tm";
  const engineId = options.crowdin.engineId || "";
  if (!branch) {
    return;
  }
  if (method === "mt" && !engineId) {
    console.log("no engineId ");
    return;
  }

  const langStr = !options.__langs ? "" : options.__langs.map((lang) => {
    return `--language "${lang}"`;
  }).join(" ")
  const engineStr = method === "mt" ? `--engine-id=${engineId}` : "";
  const paramsStr = `${langStr} ${engineStr} --method ${method}`

  const crowdinOptions = options.crowdin;
  const regx = new RegExp(helper.fitRegx(crowdinOptions.argsPlaceholder || ""), "ig");
  const args = (options.__crowdinArgs || "").replace(regx, "-") || paramsStr;



  if (branch === "master") {
    shell.exec(`crowdin pre-translate ` + args);
  } else {
    shell.exec(`crowdin pre-translate -b ${branch} ` + args);
  }
}