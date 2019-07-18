const templatedRegExp = require("templated-regular-expression");
const keyword = require("./keyword");

module.exports = templatedRegExp(
{
    // https://www.w3.org/TR/css-color-4/#hex-notation
    "hex3.digit": /[0-9a-fA-F]/,
    "hex6.digit": /${hex3.digit}${hex3.digit}/,
    
    // 3 digit and 4 digit
    "hex3": /^#(${hex3.digit})(${hex3.digit})(${hex3.digit})(${hex3.digit})?$/,

    // 6 and 8 digit
    "hex6": /^#(${hex6.digit})(${hex6.digit})(${hex6.digit})(${hex6.digit})?$/
});
