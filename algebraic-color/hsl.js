const { data, number } = require("@algebraic/type");
const numeric = require("./css/numeric");

const HSL = data `HSL` (
    hue         => number,
    saturation  => number,
    lightness   => number,
    alpha       => [number, 1.0] );

module.exports = HSL;

HSL.css = { parse, test: string => CSSRegExp.test(string) };

const normalize = isPercentage => isPercentage ?
    string => parseFloat(string) / 100 :
    string => parseInt(string, 10) / 255;

function parse(string)
{
    const components = string.match(CSSRegExp);
    const isSpaceSeparated = components[1] === void(0);
    const shift = isSpaceSeparated ? 5 : 1;

    const hueRaw = components[shift];
    const hueMagnitude = parseFloat(hueRaw);
    const hue =
        hueRaw.endsWith("grad") ? hueMagnitude / 400 :
        hueRaw.endsWith("rad") ? hueMagnitude / (2 * Math.PI) :
        hueRaw.endsWith("turn") ? hueMagnitude :
        // Default and deg are both degrees
        // hueRaw.endsWith("deg") ?
        hueMagnitude / 360;
    const saturation = parseFloat(components[shift + 1]) / 100;
    const lightness = parseFloat(components[shift + 2]) / 100;

    const alphaString = components[shift + 3];
    const alpha = alphaString === void(0) ?
        1.0 :
        normalize(numeric.percentage.test(alphaString))(alphaString);

    return HSL({ hue, saturation, lightness, alpha });
}

const CSSRegExp = (function ()
{
    const templatedRegExp = require("templated-regular-expression");
    const keyword = require("./css/keyword");

    return templatedRegExp(
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
    }).hsl;
})();

