const templatedRegExp = require("templated-regular-expression");
const keyword = require("./keyword");
const numeric = require("./numeric");


module.exports = templatedRegExp(
{
    ...numeric,

    // https://www.w3.org/TR/css-color-4/#the-hsl-notation
    // Also for legacy reasons, an hsla() function also exists, with an
    // identical grammar and behavior to hsl().
    "hsl": /^${hsl.keyword}[aA]?\(\s*${hsl.components}\s*\)$/,

    "hsl.keyword": keyword("hsl"),
    "hsl.components": /${hsl.modern}|${hsl.legacy}/,

    // hsl() = hsl( <hue> <percentage> <percentage> [ / <alpha-value> ]? )
    // <hue> = <number> | <angle>
    "div": /\s*\/\s*/,
    "hsl.modern":
        /(${hue})\s+(${percentage})\s+(${percentage})(?:${div}(${alpha}))?/,

    // For legacy reasons, hsl() also supports an alternate syntax that
    // separates all of its arguments with commas:
    // hsl() = hsl( <hue>, <percentage>, <percentage>, <alpha-value>? )
    ",": /\s*,\s*/,
    "hsl.legacy":
        /(${hue})${,}(${percentage})${,}(${percentage})(?:${,}(${alpha}))?/,

    "hue": /${number}|${angle}/,
}).hsl;
