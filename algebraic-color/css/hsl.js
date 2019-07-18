const templatedRegExp = require("templated-regular-expression");

const keyword = require("./keyword");
const numeric = require("./numeric");
const normalize = require("./normalize");

const HSL = require("../hsl");

module.exports.test = string => HSLRegExp.test(string);

module.exports.parse = function parse(string)
{
    const components = string.match(HSLRegExp);
    const isSpaceSeparated = components[1] === void(0);
    const shift = isSpaceSeparated ? 5 : 1;

    const hueRaw = components[shift];
    const hueMagnitude = parseFloat(hueRaw);
    const hue =
        hueRaw.endsWith("grad") ?
            (hueMagnitude % 400) / 400 :
        hueRaw.endsWith("rad") ?
            (hueMagnitude % (2 * Math.PI)) / (2 * Math.PI) :
        hueRaw.endsWith("turn") ?
            hueMagnitude % 1 :
        // Default and deg are both degrees
        // hueRaw.endsWith("deg") ?
        (hueMagnitude % 360) / 360;
    const saturation = normalize(100)(components[shift + 1]);
    const lightness = normalize(100)(components[shift + 2]);

    const alphaString = components[shift + 3];
    const alphaIsPercentage = numeric.percentage.test(alphaString);
    const alpha = alphaString === void(0) ?
        1.0 :
        normalize(alphaIsPercentage ? 100 : 1)(alphaString);

    return HSL({ hue, saturation, lightness, alpha });
}

const { hsl: HSLRegExp } = templatedRegExp(
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

    "hsl.modern":
        /(${hue})\s+(${percentage})\s+(${percentage})(?:${div}(${alpha}))?/,

    // For legacy reasons, hsl() also supports an alternate syntax that
    // separates all of its arguments with commas:
    // hsl() = hsl( <hue>, <percentage>, <percentage>, <alpha-value>? )

    "hsl.legacy":
        /(${hue})${,}(${percentage})${,}(${percentage})(?:${,}(${alpha}))?/,

    // Shorthands:
    ",": /\s*,\s*/,
    "div": /\s*\/\s*/
});
