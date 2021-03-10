const template = require("../template");
const type = require("../type");

const applied = (name, implementation, arguments) =>
    type(name, (console.log("it is",implementation(...arguments.map(argument => [argument]))),implementation(...arguments.map(argument => [argument]))));

const apply = (NominalT, { implementation }, construct, arguments) =>
    /* tagged */
    template.isTaggedCall(arguments) ?
        (...rest) =>
            applied(template.resolve(...arguments), implementation, rest) :
        applied(
            toAppliedName(NominalT, arguments),
            implementation,
            arguments);

const toAppliedName = (FT, arguments) =>
    `${type.typename(FT)}(${arguments
        .map(T => type.typename(T))
        .join(", ") })`;

module.exports = implementation => ({ apply, implementation });





// ALIAS:
// type(name, OTHER_TYPE) --> need to store function, args.


