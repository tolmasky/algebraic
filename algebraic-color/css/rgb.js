const templatedRegExp = require("templated-regular-expression");

const keyword = require("./keyword");
const numeric = require("./numeric");
const normalize = require("./normalize");

const RGB = require("../rgb");

module.exports.test = string => RGBRegExp.test(string);

module.exports.parse = function parse(string)
{
    const components = string.match(RGBRegExp);
    const isPercentage = components[1] === void(0);
    const shift = isPercentage ? 5 : 1;
    const [red, green, blue] = components
        .slice(shift, shift + 3)
        .map(normalize(isPercentage ? 100 : 255));

    const alphaString = components[shift + 3];
    const alphaIsPercentage = numeric.percentage.test(alphaString);
    const alpha = alphaString === void(0) ?
        1.0 :
        normalize(alphaIsPercentage ? 100 : 1)(alphaString);

    return RGB({ red, green, blue, alpha });
}

const { rgb: RGBRegExp } = templatedRegExp(
{
    ...numeric,

    // https://www.w3.org/TR/css-color-4/#funcdef-rgb
    // Also for legacy reasons, an rgba() function also exists, with an
    // identical grammar and behavior to rgb().
    "rgb": /^${rgb.keyword}[aA]?\(\s*${rgb.list}\s*\)$/,

    "rgb.keyword": keyword("rgb"),
    "rgb.list": /${rgb.list.numbers}|${rgb.list.percentages}/,

    //  rgb() = rgb( <percentage>#{3} , <alpha-value>? ) |
    //          rgb( <number>#{3} , <alpha-value>? )
    "rgb.list.percentages":
        /(${%})${,}(${%})${,}(${%})(?:${,}(${alpha}))?/,

    "rgb.list.numbers":
        /(${number})${,}(${number})${,}(${number})(?:${,}(${alpha}))?/,

    // Shorthands:
    ",": /\s*,\s*/,
    "%": /${percentage}/
});



