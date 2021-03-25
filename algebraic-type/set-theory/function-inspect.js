const intrinsics = new Set([Array.isArray]);
const style = require("./style");


module.exports = function (stylize, f)
{
    return  intrinsics.has(f) ?
                `${style("magenta", f.name)}(${style.x})` :
            f.name && f.name !== "predicate" ?
                `${style("special", f.name)}(${style.x})` :
            f + "";
}
