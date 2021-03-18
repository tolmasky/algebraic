const { hasOwnProperty } = Object;
const fail = require("../fail");
const fromEntries = require("@climb/from-entries");
const type = require("./type");
const provenancing = require("./provenancing");
const CachedFields = new WeakMap();
const given = f => f();

const toResolvedFields = fields => Object
    .entries(fields)
    .map(([name, fValue]) => [name, fValue()]);

const ResolvedCachedFields = new WeakMap();
const toResolvedFieldsCached = T =>
    ResolvedCachedFields.has(T) ?
        ResolvedCachedFields.get(T) :
        given((fields = toResolvedFields(T)) =>
            (ResolvedCachedFields.set(T, fields), fields));


const data = provenancing(function data(fields)
{
    const T = provenancing(function data_pizza(values)
    {
        // FIXME: values instanceof T return values...
        // FIXME: We should be copying fields to be safe, so again
        // the implication that we want an inbetween type...
        const resolved = toResolvedFieldsCached(fields);

        // FIXME: T is no good here, because we might be an alias?...
        return fromEntries(resolved.map(initialize(T, values)));
    });

    return T;
});

module.exports = data;

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

const Field = type `field` (data({ name: of => type.string, type: of => type.any }));
const getFields = provenance =>
    provenance.function === data ?
        toResolvedFieldsCached(provenance.arguments[0]) :
        getFields(provenance.parent);


data.fields = T => getFields(T["Provenance"])
    .map(([name, type]) => Field({ name, type }));

