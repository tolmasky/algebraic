const type = require("./type");

const test = type `test` ({ x: of => type.number });

console.log(test({x:4}));

// We have this issue of satisfies(instance vs. type)

const Tree = type `Tree` (([T] = type) => T);


const TreeAppliedWithName = Tree `NewName` (test);

console.log(type.satisfies(type, Tree));

console.log(TreeAppliedWithName);
console.log(TreeAppliedWithName({x:4}));

console.log(Tree(test));

console.log(Tree(test) + "");
console.log(Tree(test)({x:4}));
