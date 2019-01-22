/**
 *  同名key的，修改成keyname__repeated__num形式
 */
const REPEATED_KEY = '__repeated__';
module.exports = function (context, merged) {
  merged = JSON.parse(JSON.stringify(merged)); // dont modify origin

  Object.keys(merged).forEach((lang) => {
    const langData = merged[lang];
    const repeated = langData[REPEATED_KEY];
    Object.keys(repeated).forEach((key) => {
      repeated[key].forEach((text, index) => {
        langData[index === 0 ? key : (key + REPEATED_KEY + index)] = text;
      });
    });
    delete langData[REPEATED_KEY];
  });
  return merged;
}