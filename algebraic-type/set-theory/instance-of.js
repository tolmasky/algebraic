const { Union, Predicated, ...Set } = require("./set");
const fInspect = require("./function-inspect");
const style = require("./style");


module.exports = constructor => Predicated
({
    subsetof: Union(Set.object, Set.function),
    predicate: toInstanceOf(constructor)
});

toInstanceOf = constructor => Object.assign(
    x => x instanceof constructor,
    {
        [fInspect.custom]: (stylize, f) =>
        [
            style.x,
            style("magenta", "instanceof"),
            style("special", constructor.name)
        ].join(" ")
    });
