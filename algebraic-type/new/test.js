const type = require("./type");

const test = type `test` ({ x: of => type.number });

console.log(test({x:4}));

const Tree = type `Tree` (([T] = type) => T);

console.log(Tree(test));
//console.log(Tree(test)({x:4}));
