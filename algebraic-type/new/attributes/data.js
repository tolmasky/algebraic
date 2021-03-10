const { hasOwnProperty } = Object;
const fromEntries = require("@climb/from-entries");
const fail = require("../../fail");
const type = require("../type");
const given = f => f();


const EmptyArguments = Object.freeze(Object.create(null));

const toFields = definition =>
    definition.fields ?
        definition.fields :
        definition.fields = Object
            .entries(definition.fFields)
            .map(([key, value]) => [key, value()])

const apply = (NominalT, definition, construct, args) => given((
    values = args.length <= 0 ? EmptyArguments : args[0]) =>
    Object.assign(
        this instanceof NominalT ?
            this :
            construct(NominalT),
        fromEntries(toFields(definition)
            .map(([key, FieldT]) =>
                !hasOwnProperty.call(values, key) ?
                    fail.type(``) :
                given((value = values[key]) =>
                [
                    key,
                    type.satisfies(FieldT, value) ?
                        value :
                        fail.type(``)
                ])))));

module.exports = fFields => ({ apply, fFields });
