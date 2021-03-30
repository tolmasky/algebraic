const intrinsics = new Set([Array.isArray]);
const { hasOwnProperty } = Object;
const style = require("./style");
const custom = Symbol("custom");


module.exports = function (stylize, f)
{
    return  intrinsics.has(f) ?
                `${style("magenta", f.name)}(${style.x})` :
            hasOwnProperty.call(f, custom) ?
                f[custom](stylize, f) :
            f.name && f.name !== "predicate" ?
                `${style("special", f.name)}(${style.x})` :
            f + "";
}

module.exports.custom = custom;
