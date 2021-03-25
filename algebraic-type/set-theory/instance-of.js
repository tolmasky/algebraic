const { Union, Predicated, ...Set } = require("./set");


module.exports = constructor => Predicated
({
    subsetof: Union(Set.object, Set.function),
    predicate: x => x instanceof constructor
});
