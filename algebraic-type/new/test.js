const type = require("./type");

const test = type `test` ({ x: of => type.number });

console.log(test({x:4}));

const Tree = type `Tree` (([T] = type) => { console.log("IN HERE!", T); return T });


const TreeAppliedWithName = Tree `NewName` (test);

console.log(TreeAppliedWithName);
console.log(TreeAppliedWithName({x:4}));

console.log(Tree(test));

console.log(Tree(test) + "");
console.log(Tree(test)({x:4}));
