const { type, typename, caseof } = require("@algebraic/type");
const Node = require("./node");


const Statement = type `Statement` (
    Object
        .entries(require("./statements"))
        .filter(([name]) => name.endsWith("Statement"))
        .map(([name, T]) => caseof (`.${name}`, of => T)));

module.exports = Statement;
