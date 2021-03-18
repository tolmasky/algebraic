const { hasOwnProperty } = Object;
const fail = require("../fail");
const type = require("./type");
const CachedFields = new WeakMap();
const given = f => f();

const highlighted = ([color]) => string => `${color}${string}\x1b[0m`;
const toTypeString = T => highlighted `\x1b[36m` (type.typename(T));

const toResolvedTypes = types => types
    .map(fType => fType instanceof type ? fType : fType());

const ResolvedTypesCached = new WeakMap();
const toResolvedTypesCached = T =>
    ResolvedTypesCached.has(T) ?
        ResolvedTypesCached.get(T) :
        given((types = toResolvedTypes(type.attributes(T).types)) =>
            (ResolvedTypesCached.set(T, types), types));


const types = ΣT => toResolvedTypesCached(ΣT);

const apply = T => fail (`${toTypeString(type.typename(T))} is not a constructible type.`);
const satisfies = (ΣT, candidate) =>
    types(ΣT).some(Ti => type.satisfies(Ti, candidate));


module.exports = (...types) => ({ apply, types, satisfies });
