const template = require("../template");
const type = require("../type");


const toAppliedName = (FT, arguments) =>
    `${type.typename(FT)}(${arguments
        .map(T => type.typename(T))
        .join(", ") })`;

const apply = (NominalT, T, construct, arguments) =>

    // Tagged application is shorthand for top-level aliasing:
    // FT `name` (T1, T2) === type `name` (FT(T1, T2))

    template.isTaggedCall(arguments) ?
        // An alternative implementation is to do:
        // type(
        //    template.resolve(...arguments),
        //    (...args) => NominalT(...args.map(([f]) => f)))
        // But this aliases the entire function, instead of the *result*,
        // leading to X `name` (T1, T2) to have the name "name(T1, T2)" instead
        // of the preferred "name".
        //
        // The possible downside of this method is that X `name` is not itself a
        // type, but perhaps that is fine because you should just be doing
        // type `name` (X) instead.
        (...rest) => type(template.resolve(...arguments), NominalT(...rest)) :

        type(
            toAppliedName(NominalT, arguments),
            type
                .attributes(T)
                .implementation(...arguments.map(argument => [argument])));

module.exports = implementation => ({ apply, implementation });





// ALIAS:
// type(name, OTHER_TYPE) --> need to store function, args.


