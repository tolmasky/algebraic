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


const construct = (T, instantiate, { fields }, values) =>
    values instanceof T ?
        values :
        instantiate(
            T,
            fromEntries(
                toResolvedFieldsCached(fields)
                    .map((console.log(T, values),initialize(T, values)))));

module.exports = fields => ({ construct, fields: { ...fields } });

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
/*
const Field = type `field` ({ name: of => type.string, type: of => type.any });
const getFields = provenance =>
    provenance.function === data ?
        toResolvedFieldsCached(provenance.arguments[0]) :
        getFields(provenance.parent);


data.fields = T => getFields(T["Provenance"])
    .map(([name, type]) => Field({ name, type }));
*/
