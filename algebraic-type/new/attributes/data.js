const { hasOwnProperty } = Object;
const fromEntries = require("@climb/from-entries");
const fail = require("../../fail");
const type = require("../type");
const given = f => f();


const EmptyArguments = Object.freeze(Object.create(null));

const CachedFields = new WeakMap();

const toFields = T => Object
    .entries(type.attributes(T).fFields)
    .map(([key, value]) => [key, value()]);

const toFieldsCached = T =>
    CachedFields.has(T) ?
        CachedFields.get(T) :
        given((fields = toFields(T)) =>
            (CachedFields.set(T, fields), fields));


const apply = (NominalT, T, construct, args) => given((
    values = args.length <= 0 ? EmptyArguments : args[0]) =>
    Object.assign(
        
        this instanceof NominalT ?
            this :
            construct(NominalT),
        fromEntries(toFieldsCached(T)
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
