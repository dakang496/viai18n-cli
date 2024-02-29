const fsExtra = require("fs-extra");
const Path = require("path");
const glob = require("glob");

module.exports = async function (options) {
    const sourceOptions = options.source;
    const transform = sourceOptions.transform;
    if (typeof transform !== 'function') {
        return;
    }
    const pattern = Object.values(options.entry || {}).reduce((result, entryPath) => {
        return [].concat(sourceOptions.pattern).map(function (p) {
            return Path.resolve(entryPath, p);
        }).concat(result);
    }, []);

    const files = glob.sync(pattern);
    files.forEach(filePath => {
        try {
            const content = fsExtra.readFileSync(filePath, {
                encoding: "utf8",
            });
            const newContent = transform(content);
            if (newContent && newContent !== content) {
                fsExtra.outputFileSync(filePath, newContent);
            }
        } catch (error) {

        }
    });
};