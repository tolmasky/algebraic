const { prototype: ArrayPrototype, isArray } = Array;
const { assign, entries, freeze, hasOwnProperty, setPrototypeOf } = Object;
const fromEntries = require("@climb/from-entries");

const Instantiate = { };
const UseFallbackForEveryField = { };
const private = require("./private");
const f = require("./function-define");
const given = f => f();
const fail = require("./fail");

const type = require("./type");


function product(name, definition, toFallback)
{
    const isTupleDefinition = isArray(definition);
    const T = f.constructible(name, function (T, values)
    {
        return  values instanceof T ? values :
                values === Instantiate ? this :
                freeze(assign(
                    isTupleDefinition ?
                        setPrototypeOf([], T.prototype) :
                    this instanceof T ?
                        this :
                        new T(Instantiate),
                    fromEntries(fields(T)
                        .map(initialize(
                            T,
                            values || UseFallbackForEveryField)))));
    },
    type.prototype);

    if (isTupleDefinition)
        Object.setPrototypeOf(T.prototype, ArrayPrototype);

    private(T, "fieldDefinitions", () => entries(definition));
    private(T, "toFallback", () =>
        toFallback ||
        // FIXME: Automatic if all fields can be automatic.
        (() => fail(`No fallback for ${T}`)));

    return T;
}

module.exports = product;

function fallback(T)
{
    return private(T, "fallback", () => private(T, "toFallback")());
}

function fields(T)
{
    return private(T, "fields", () =>
        private(T, "fieldDefinitions")
            .map(([name, f]) => [name, f()])
            .map(([name, constraint]) => ({ name, constraint, type: constraint })));
}


const initialize = (T, values) => field =>
    given((candidate = toCandidate(T, values, field)) =>
        !type.belongs(field.type, candidate) ?
            fail.type(
                `${toTypeString(T)} constructor passed invalid value` +
                ` for field ${toValueString(field.name)}:\n` +
                `  Expected: type ${toTypeString(field.type)}\n` +
                `  Found: ${toValueString(candidate)} ` +
                `of type ${toTypeString(type.of(candidate))}`) :
        [field.name, candidate]);

// FIXME: Should we throw if you attempt to pass something for a computed value?
// FIXME: Need to resolve the other props...
const toCandidate = (T, values, { name, ...field }) =>
    hasOwnProperty.call(values, name) ? values[name] :
    hasOwnProperty.call(field, "default") ? field.default :
    hasOwnProperty.call(field, "compute") ? field.compute(values) :
    fail.type(
        `${toTypeString(T)} constructor requires field ` +
        `${toValueString(name)}.`)




/*
const given = f => f();
const fail = require("./fail");


fields.resolve = Object
    .entries(fields)
    .map(([name, f]) => [name, f()])
    .map(([name, resolved]) => given((
    // FIXME: UGH!!!
        annotated = resolved instanceof require("./annotated")) =>
    ({
        name,
        type: annotated ? resolved.type : resolved,
        ...(annotated && resolved.annotations)
    })));

const toResolvedFields = fields => Object
    .entries(fields)
    .map(([name, f]) => [name, f()])
    .map(([name, resolved]) => given((
    // FIXME: UGH!!!
        annotated = resolved instanceof require("./annotated")) =>
    ({
        name,
        type: annotated ? resolved.type : resolved,
        ...(annotated && resolved.annotations)
    })));

const ResolvedCachedFields = new WeakMap();
const toResolvedFieldsCached = T =>
    ResolvedCachedFields.has(T) ?
        ResolvedCachedFields.get(T) :
        given((fields = toResolvedFields(T)) =>
            (ResolvedCachedFields.set(T, fields), fields));


const AllDefaults = {};
const construct = (T, instantiate, { fields }, values) =>
    values instanceof T ?
        values :
        instantiate(
            T,
            fromEntries(
                toResolvedFieldsCached(fields)
                    .map(initialize(T, values || AllDefaults))));

const satisfies = (ΠT, candidate) => ΠT === candidate;

module.exports = fields => ({ construct, satisfies, fields: { ...fields } });

module.exports.fields = T => (console.log(type.attributes(T)),toResolvedFieldsCached(type.attributes(T).fields))

const highlighted = ([color]) => string => `${color}${string}\x1b[0m`;
const toTypeString = T => highlighted `\x1b[36m` (type.typename(T));
const toValueString = value => highlighted `\x1b[35m` (
    value === void(0) ? "undefined" :
    value === null ? "null" :
    typeof value === "function" ? `[function ${value.name}]` :
//    typeof value !== "object" ? JSON.stringify(value, null, 2) :
//    of(value) && getKind(of(value)) ? value + "" :
    JSON.stringify(value, null, 2));

// FIXME: Should we throw if you attempt to pass something for a computed value?
// FIXME: Need to resolve the other props...
const toCandidate = (T, values, { name, ...field }) =>
    hasOwnProperty.call(values, name) ? values[name] :
    hasOwnProperty.call(field, "default") ? field.default :
    hasOwnProperty.call(field, "compute") ? field.compute(values) :
    fail.type(
        `${toTypeString(T)} constructor requires field ` +
        `${toValueString(name)}.`);

const initialize = (T, values) => field =>
    given((candidate = toCandidate(T, values, field)) =>
        !type.belongs(field.type, candidate) ?
            fail.type(
                `${toTypeString(T)} constructor passed invalid value` +
                ` for field ${toValueString(field.name)}:\n` +
                `  Expected: type ${toTypeString(field.type)}\n` +
                `  Found: ${toValueString(candidate)} ` +
                `of type ${toTypeString(type.of(candidate))}`) :
        [field.name, candidate]);

/*
const Field = type `field` ({ name: of => type.string, type: of => type.any });
const getFields = provenance =>
    provenance.function === data ?
        toResolvedFieldsCached(provenance.arguments[0]) :
        getFields(provenance.parent);


data.fields = T => getFields(T["Provenance"])
    .map(([name, type]) => Field({ name, type }));
*/

