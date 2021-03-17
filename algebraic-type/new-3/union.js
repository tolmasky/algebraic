const { hasOwnProperty } = Object;
const fail = require("../fail");
const type = require("./type");
const CachedFields = new WeakMap();
const given = f => f();

const highlighted = ([color]) => string => `${color}${string}\x1b[0m`;
const toTypeString = T => highlighted `\x1b[36m` (type.typename(T));

const toResolvedFields = fields => Object
    .entries(fields)
    .map(([name, fValue]) => [name, fValue()]);

const ResolvedCachedFields = new WeakMap();
const toResolvedFieldsCached = T =>
    ResolvedCachedFields.has(T) ?
        ResolvedCachedFields.get(T) :
        given((fields = toResolvedFields(T)) =>
            (ResolvedCachedFields.set(T, fields), fields));



const apply = T => fail (`${toTypeString(type.typename(T))} is not a constructible type.`);

module.exports = (...types) => ({ apply, types });
