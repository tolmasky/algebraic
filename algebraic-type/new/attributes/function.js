const template = require("../template");
const type = require("../type");


const toAppliedName = (FT, arguments) =>
    `${type.typename(FT)}(${arguments
        .map(T => type.typename(T))
        .join(", ") })`;

const apply = (NominalT, T, construct, arguments) =>
    /* tagged */
    template.isTaggedCall(arguments) ?
        type(template.resolve(...arguments), NominalT) :
        type(
            NominalT === T ?
                toAppliedName(NominalT, arguments) :
                type.typename(NominalT),
            type
                .attributes(T)
                .implementation(...arguments.map(argument => [argument])));

module.exports = implementation => ({ apply, implementation });





// ALIAS:
// type(name, OTHER_TYPE) --> need to store function, args.


