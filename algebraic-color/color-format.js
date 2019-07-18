const templatedRegExp = require("templated-regular-expression");
const hsl = require("./hsl");
const rgb = require("./rgb");

module.exports = templatedRegExp(
{
    hex3: require("./hex").hex3,
    hex6: require("./hex").hex6,
    hsl: require("./hsl"),
    rgb: require("./rgb"),
    gray: require("./gray"),
});

/*
const formatRegExps = 
const spaces = parseSpaces(
{
    hx3a: /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/,
    hx6a: /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/,
    rgb: /^rgb\(\s*(INT)\s*,\s*(INT),\s*(INT)\s*\)$/,
    rgba: /^rgba\(\s*(INT)\s*,\s*(INT),\s*(INT)\s*,\s*(FLOAT)\s*\)$/,
    hsl: /^hsl\(\s*(FLOAT)\s*,\s*(FLOAT)%,\s*(FLOAT)%\s*\)$/,
    hsla: /^hsla\(\s*(FLOAT)\s*,\s*(FLOAT)%,\s*(FLOAT)%\s*,\s*(FLOAT)\s*\)$/,
    hsv: /^hsv\(\s*(FLOAT)\s*,\s*(FLOAT)%,\s*(FLOAT)%\s*\)$/,
    hsva: /^hsva\(\s*(FLOAT)\s*,\s*(FLOAT)%,\s*(FLOAT)%\s*,\s*(FLOAT)\s*\)$/
});

function parseSpaces(spaces)
{
    const parse = space => new RegExp(space
        .source
        .replace(/INT/g, "\\d+")
        .replace(/FLOAT/g, "\\d+(?:\\.\\d+)?"));

    return Object
        .keys(spaces)
        .reduce((result, key) =>
            Object.assign(result, { [key]: parse(spaces[key]) }),
        { });
}

module.exports.getComponent = function getComponent(aComponent, color)
{
    if (typeof color === "string")
        return getComponent(aComponent, parse(color));

    const fromSpace = color.space;
    const [toSpace, component] = aComponent === "a" ?
        [fromSpace, "a"] : aComponent.split(".");

    return convert(toSpace, color)[component];
}

module.exports.toComponent = function toComponent(aComponent, aValue, color)
{
    if (typeof color === "string")
        return toString(toComponent(aComponent, aValue, parse(color)));

    const fromSpace = color.space;
    const [toSpace, component] = aComponent === "a" ?
        [fromSpace, "a"] : aComponent.split(".");

    const converted = convert(toSpace, color);

    return convert(fromSpace, { ...converted, [component]: aValue });
}

function getSpaceForComponent(aComponent)
{
    return  aComponent.match(/[rgb]/g) && "rgba" ||
            aComponent.match(/[hsl]/g) && "hsla" ||
            aComponent.match(/[hx3]/g) && "hx3a" ||
            aComponent.match(/[hx6]/g) && "hx6a" ||
            aComponent.match(/[hsv]/g) && "hsva";
}

function parseHexString(aColorString)
{
    const hx6aMatches = aColorString.match(spaces.hx6a);

    if (hx6aMatches)
    {
        const [, r, g, b, a] = hx6aMatches;
        return {
            space: "hx6a",
            a: typeof a === "undefined" ? 1 : a,
            r: parseInt(r, 16) / 255,
            g: parseInt(g, 16) / 255,
            b: parseInt(b, 16) / 255
        };
    }

    const hx3aMatches = aColorString.match(spaces.hx3a);

    if (hx3aMatches)
    {
        const [, r, g, b, a] = hx3aMatches;
        return {
            space: "hx3a",
            a: typeof a === "undefined" ? 1 : a,
            r: parseInt(r, 16) / 15,
            g: parseInt(g, 16) / 15,
            b: parseInt(b, 16) / 15
        };
    }

    orThrow("Unrecognized color format");
}

function parse(aColorString)
{
    const match = aColorString.match(/^#|rgba|rgb|hsla|hsl|hsva/);
    const space = match && match[0] || orThrow("Unrecognized color format");
    if (space === "#")
        return parseHexString(aColorString);

    const matches = aColorString.match(spaces[space]) ||
                    orThrow(`Syntax Error in ${space} string` + aColorString);
    const a = space.charAt(3) === "a" ? parseFloat(matches[4]) : 1;
    const resultSpace = space.length < 4 ? space + "a" : space;

    if (resultSpace === "rgba")
        return  {
                    space: resultSpace,
                    a,
                    r: parseInt(matches[1], 10) / 255,
                    g: parseInt(matches[2], 10) / 255,
                    b: parseInt(matches[3], 10) / 255
                };

    if (resultSpace === "hsla")
        return  {
                    space: resultSpace,
                    a,
                    h: parseFloat(matches[1]) / 360,
                    s: parseFloat(matches[2]) / 100,
                    l: parseFloat(matches[3]) / 100
                }

    if (resultSpace === "hsva")
        return  {
                    space: resultSpace,
                    a,
                    h: parseFloat(matches[1]) / 360,
                    s: parseFloat(matches[2]) / 100,
                    v: parseFloat(matches[3]) / 100
                }
}

function orThrow(string)
{
    throw new Error(string)
}

module.exports.toSpace = toSpace;

function toSpace(aSpace, aColorString)
{
    return toString(convert(aSpace, parse(aColorString)));
}

module.exports.getSpace = getSpace;

function getSpace(aColorString)
{
    return parse(aColorString).space;
}

module.exports.toString = toString;

function toString(color)
{
    const { space, a } = color;

    if (space === "hsv" || space === "hsva")
    {
        const { h, s, v } = color;

        return `hsva(${h * 360}, ${s * 100}%, ${v * 100}%, ${a})`;
    }

    if (space === "hsl" || space === "hsla")
    {
        const { h, s, l } = color;

        return `hsla(${h * 360}, ${s * 100}%, ${l * 100}%, ${a})`;
    }

    const { r, g, b } = color;
    if (space === "hx3a")
    {
        const rgb15 = value => parseInt(value * 15, 10);
        const colorStrs = [r, g, b].map((c) => rgb15(c).toString(16));

        return `#${colorStrs.join("")}${a < 1 ? rgb15(a).toString(16) : ""}`;
    }

    const rgb255 = value => parseInt(value * 255, 10);
    if (space === "hx6a")
    {
        const prefix = (str) => str.length === 1 ? `0${str}` : str;
        const colorStrs = [r, g, b].map((c) => prefix(rgb255(c).toString(16)));

        return `#${colorStrs.join("")}${a < 1 ? prefix(rgb255(a).toString(16)) : ""}`;
    }

    return `rgba(${rgb255(r)}, ${rgb255(g)}, ${rgb255(b)}, ${a})`;
}

function convert(to, color)
{
    const { space } = color;

    if (space === to)
        return color;

    return conversions[space][to](color);
}

const conversions = { rgba: { }, hsva: { }, hsla: { }, hx6a: { }, hx3a: { } };

conversions["rgba"]["hsla"] = function ({ r, g, b, a })
{
    const maximum = Math.max(r, g, b);
    const minimum = Math.min(r, g, b);
    const l = (maximum + minimum) / 2.0;

    if (maximum === minimum)
        return { space:"hsla", h:0, s:0, l, a };

    const d = maximum - minimum;
    const s = l > 0.5 ? d / (2 - maximum - minimum) : d / (maximum + minimum);
    const h =
    ({
        [r]: () => (g - b) / d + (g < b ? 6 : 0),
        [g]: () => (b - r) / d + 2,
        [b]: () => (r - g) / d + 4
    })[maximum]();

    return { space:"hsla", h: h / 6, s, l, a };
}

conversions["rgba"]["hsva"] = function (color)
{
    const hsla = conversions["rgba"]["hsla"](color);

    return conversions["hsla"]["hsva"](hsla);
}

conversions["hsla"]["rgba"] = function ({ h: h_1, s, l, a })
{
    const h = h_1 * 360;
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const hPrime = h / 60;
    const x = chroma * (1 - Math.abs(hPrime % 2 - 1));
    const m = l - chroma / 2;

    const [rPrime, gPrime, bPrime] =
        h < 60 && [chroma, x, 0] ||
        h < 120 && [x, chroma, 0] ||
        h < 180 && [0, chroma, x] ||
        h < 240 && [0, x, chroma] ||
        h < 300 && [x, 0, chroma] ||
        h < 360 && [chroma, 0, x] ||
        [0,0,0];

    const r = rPrime + m;
    const g = gPrime + m;
    const b = bPrime + m;

    return { space:"rgba", r, g, b, a };
}

conversions["hsva"]["hsla"] = function ({ h, s, v, a })
{
    const l = 0.5 * v * (2 - s);
    const sHSLA = s * v / (1 - Math.abs(2 * l - 1));

    if (sHSLA !== sHSLA)
        return { space:"hsla", h, s: 0, l, a };

    return { space:"hsla", h, s: sHSLA, l, a };
}

conversions["hsva"]["rgba"] = function (color)
{
    const hsla = conversions["hsva"]["hsla"](color);

    return conversions["hsla"]["rgba"](hsla);
}

conversions["hsla"]["hsva"] = function ({ h, s, l, a })
{
    const v = (2 * l + s * (1 - Math.abs(2 * l - 1))) / 2;
    const sHSVA = 2 * (v - l) / v;

    if (sHSVA !== sHSVA)
        return { space: "hsva", h, s: 0, v, a };

    return { space: "hsva", h, s: sHSVA, v, a };
}

conversions["hx3a"]["hsva"] = conversions["rgba"]["hsva"];
conversions["hx6a"]["hsva"] = conversions["rgba"]["hsva"];
conversions["hsva"]["hx3a"] = (c) => { var result = conversions["hsva"]["rgba"](c); result.space = "hx3a"; return result; };
conversions["hsva"]["hx6a"] = (c) => { var result = conversions["hsva"]["rgba"](c); result.space = "hx6a"; return result; };
conversions["hx3a"]["hsla"] = conversions["rgba"]["hsla"];
conversions["hx6a"]["hsla"] = conversions["rgba"]["hsla"];
conversions["hsla"]["hx3a"] = (c) => { var result = conversions["hsla"]["rgba"](c); result.space = "hx3a"; return result; };
conversions["hsla"]["hx6a"] = (c) => { var result = conversions["hsla"]["rgba"](c); result.space = "hx6a"; return result; };
conversions["hx3a"]["rgba"] = (c) => { c.space = "rgba"; return c; };
conversions["hx6a"]["rgba"] = (c) => { c.space = "rgba"; return c; };
conversions["rgba"]["hx3a"] = (c) => { c.space = "hx3a"; return c; };
conversions["rgba"]["hx6a"] = (c) => { c.space = "hx6a"; return c; };*/
