const Node = require("./node");
const { parse, parseExpression } = require("@babel/parser");
const fromBabel = require("./from-babel");

module.exports = (...args) =>
    fromBabel(Node.Program, parse(...args).program);
module.exports.expression =  (...args) =>
    fromBabel(Node.Expression, parseExpression(...args));
