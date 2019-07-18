const { data, number } = require("@algebraic/type");
const numeric = require("./css/numeric");

const RGB = data `RGB` (
    red     => number,
    green   => number,
    blue    => number,
    alpha   => [number, 1.0] );

module.exports = RGB;

RGB.css = { parse, test: string => CSSRegExp.test(string) };

const normalize = isPercentage => isPercentage ?
    string => parseFloat(string) / 100 :
    string => parseInt(string, 10) / 255;

function parse(string)
{
    const components = string.match(CSSRegExp);
    const isPercentage = components[1] === void(0);
    const shift = isPercentage ? 5 : 1;
    const [red, green, blue] = components
        .slice(shift, shift + 3)
        .map(normalize(isPercentage));

    const alphaString = components[shift + 3];
    const alpha = alphaString === void(0) ?
        1.0 :
        normalize(numeric.percentage.test(alphaString))(alphaString);

    return RGB({ red, green, blue, alpha });
}

const CSSRegExp = (function ()
{
    const templatedRegExp = require("templated-regular-expression");
    const keyword = require("./css/keyword");

    return templatedRegExp(
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
    }).rgb;
})();

