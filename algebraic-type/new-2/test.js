const type = require("./type");

const test = type `test` ({ x: of => type.number });
console.log(typeof test);
console.log(test({x:4}));
console.log(test({}));
console.log(test({x:"hi"}));

// We have this issue of satisfies(instance vs. type)

const Tree = type `Tree` ((T/*[T] = type*/) => T);
console.log(Tree);

const TreeAppliedWithName = Tree /*`NewName`*/ (test);

console.log(TreeAppliedWithName);

const Pizza = type `Pizza` (TreeAppliedWithName);
const Pizza2 = type `Pizza2` (([T] = type) => Tree /*`NewName`*/ (test));



const aliases = provenance =>
    provenance ? [provenance.function.name, ...aliases(provenance.parent)] : []

console.log(aliases(Pizza["Provenance"]));
console.log(aliases(Pizza2["Provenance"]));
console.log(aliases(Pizza2(test)["Provenance"]));


console.log(aliases(TreeAppliedWithName["Provenance"]));
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
