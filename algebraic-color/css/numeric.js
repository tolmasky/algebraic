const templatedRegExp = require("templated-regular-expression");
const keyword = require("./keyword");


module.exports = templatedRegExp(
{
    // https://www.w3.org/TR/css3-values/#integer
    "integer": /[-+]?\d+/,
    "float": /[-+]?\d*\.\d+(?:[eE]\d+)?/,

    // https://www.w3.org/TR/css3-values/#number-value
    "number": /${integer}|${float}/,

    // https://www.w3.org/TR/css3-values/#percentage-value
    "percentage": /${number}%/,

    // https://www.w3.org/TR/css-color-4/#typedef-alpha-value
    "alpha": /${number}|${percentage}/,

    // https://www.w3.org/TR/css3-values/#angles
    "angle": /${number}(?:${deg}|${grad}|${rad}|${turn})/,

    "deg": keyword("deg"),
    "grad": keyword("grad"),
    "rad": keyword("rad"),
    "turn": keyword("turn") 
});
