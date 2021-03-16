const { hasOwnProperty } = Object;
const fail = require("../fail");
const fromEntries = require("@climb/from-entries");
const type = require("./type");
const provenancing = require("./provenancing");
const CachedFields = new WeakMap();
const given = f => f();

const toResolvedFields = entries => entries
    .map(([name, fValue]) => [name, fValue()]);

const ResolvedCachedFields = new WeakMap();
const toResolvedFieldsCached = T =>
    ResolvedCachedFields.has(T) ?
        ResolvedCachedFields.get(T) :
        given((fields = toResolvedFields(T)) =>
            (ResolvedCachedFields.set(T, fields), fields));


module.exports = provenancing(function data(fields)
{
    const unresolvedFields = Object.entries(fields);

    const T = provenancing(function data(values)
    {
        // FIXME: values instanceof T return values...
        const fields = toResolvedFieldsCached(unresolvedFields);

        // FIXME: T is no good here, because we might be an alias?...
        return fromEntries(fields.map(initialize(T, values)));
    });

    return T;
});

const highlighted = ([color]) => string => `${color}${string}\x1b[0m`;
const toTypeString = T => highlighted `\x1b[36m` (type.typename(T));
const toValueString = value => highlighted `\x1b[35m` (
    value === void(0) ? "undefined" :
    value === null ? "null" :
    typeof value === "function" ? `[function ${value.name}]` :
    typeof value !== "object" ? JSON.stringify(value, null, 2) :
    of(value) && getKind(of(value)) ? value + "" :
    JSON.stringify(value, null, 2));

const initialize = (T, values) => ([name, FieldT]) =>
    !hasOwnProperty.call(values, name) ?
        fail.type(
            `${toTypeString(T)} constructor requires field ` +
            `${toValueString(name)}.`) :
    given((candidate = values[name]) =>
        !type.satisfies(FieldT, candidate) ?
            fail.type(
                `${toTypeString(T)} constructor passed invalid value` +
                ` for field ${toValueString(name)}:\n` +
                `  Expected: type ${toTypeString(FieldT)}\n` +
                `  Found: ${toValueString(candidate)} ` +
                `of type ${toTypeString(type.of(candidate))}`) :
        [name, candidate]);
