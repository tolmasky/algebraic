const fromEntries = require("@climb/from-entries");
const fail = require("../../fail");
const type = require("../type");
const given = f => f();

const NOTHING = {};
const maybeGet = given((
    { hasOwnProperty } = Object) =>
    (object, key) => !hasOwnProperty.call(object, key) ?
        NOTHING :
        object[key]);

const valuesFromArguments = given((
    EmptyArguments = Object.freeze(Object.create(null))) =>
    arguments =>
        arguments.length <= 0 ? EmptyArguments : arguments[0]);

const toFieldsCached = given((
    CachedFields = new WeakMap(),
    toFields = T => Object
        .entries(type.attributes(T).fFields)
        .map(([key, value]) => [key, value()])) =>
    T => CachedFields.has(T) ?
        CachedFields.get(T) :
        given((fields = toFields(T)) =>
            (CachedFields.set(T, fields), fields));

const toFieldEntry = ([key, T], value) =>
    value === NOTHING ?
        fail.type(`Missing value for ${key}`) : // FIXME: default value...
    !type.satisfies(FieldT, value) ?
        fail.type(`Wrong type for ${key}`)
    [key, value];
    

    
module.exports = (name, fFields, construct) =>
({
    attributes: { fFields },
    apply: (NominalT, T, arguments) =>
        given((values = valuesFromArguments(arguments)) =>
            values instanceof NominalT ?
            values :
            construct(NominalT, fromEntries(
                toFieldsCached(T)
                    .map(entry =>
                        toFieldEntry(entry, maybeGet(values, key))))))
});
