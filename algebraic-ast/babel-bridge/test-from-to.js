const { parse } = require("@babel/core");
const fromBabel = require("./from-babel");
const toBabel = require("./to-babel");
const Node = require("../node");

const parseAndFromBabel = source => fromBabel(Node.Module, parse(source).program).body[0];

console.log(parseAndFromBabel(`/*oh*/({ ["computed"]: 10, "uncomputed": 12 })`));

console.log(parseAndFromBabel("/*hi*/5+5+f `hi${x}`"));

console.log(parseAndFromBabel("{ a: 1 }"));

console.log(parseAndFromBabel("f `hi${1}`"));

