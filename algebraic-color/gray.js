const templatedRegExp = require("templated-regular-expression");
const numeric = require("./numeric");
const keyword = require("./keyword");

module.exports = templatedRegExp(
{
    ...numeric,

    // https://www.w3.org/TR/css-color-4/#grays
    // gray() = gray( <number>  [ / <alpha-value> ]? )
    "gray": /${gray.keyword}\s*\(\s*(${number})(?:${div}(${alpha}))?\s*\)/,

    "gray.keyword": keyword("gray"),
    "div": /\s*\/\s*/,
}).gray;
