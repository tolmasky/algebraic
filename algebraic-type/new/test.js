const type = require("./type");

const test = type `test` ({ x: of => type.number });

console.log(test({x:4}));

// We have this issue of satisfies(instance vs. type)

const Tree = type `Tree` (([T] = type) => T);


const TreeAppliedWithName = Tree `NewName` (test);

const Pizza = type `Pizza` (TreeAppliedWithName);
const Pizza2 = type `Pizza2` (([T] = type) => Tree `NewName` (test));

const aliases = T => [T,
    ...(!type.attributes(T).aliasof ?
        [] :
        aliases(type.attributes(T).aliasof))];

console.log(aliases(Pizza));
console.log(aliases(Pizza2));
console.log(aliases(Pizza2(test)));


console.log(aliases(TreeAppliedWithName));
//console.log("HI", type.attributes(type.attributes(TreeAppliedWithName).aliasof));

console.log(type.satisfies(type, Tree));

console.log(TreeAppliedWithName);
console.log(TreeAppliedWithName({x:4}));

console.log(Tree(test));

console.log(Tree(test) + "");
console.log(Tree(test)({x:4}));

const TreeTest = Tree(test);


console.log(type.satisfies(TreeTest, TreeTest({x:4})));
console.log(type.satisfies(test, TreeTest({x:4})));
