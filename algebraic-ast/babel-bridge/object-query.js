const { fromEntries } = Object;
const { toPrimitive } = Symbol;
const type = require("@algebraic/type");
const TRegExp = require("templated-regular-expression");

const given = f => f();


const toFieldMapping = f => given((
    FieldRegExps = TRegExp(
    {
        "identifier": /[^\s,}{()]+/,
        "delimiter": /\s*,\s*/,
        "identifier-list": /${identifier}(?:${delimiter}${identifier})*/,
        "arrow": /\s*=>\s*/,
        "composite":
            /^\(\s*\{\s*(${identifier-list})\s*\}\s*\)${arrow}(${identifier})/,
        "single": /(${identifier})${arrow}(${identifier})/
    }),
    fString = f + "",
    matchSingle = fString.match(FieldRegExps.single),
    matchComposite = !matchSingle && fString.match(FieldRegExps.composite)) =>
    [
        (matchSingle || matchComposite)[2],
        matchSingle ?
            matchSingle[1] :
            matchComposite[1].split(FieldRegExps.delimiter)
    ]);

module.exports = given((
    Empty = Object.freeze(Object.create(null)),
    toObject = Symbol(),
    bitMasks = new Map(),
    toBitMask = query => bitMasks.has(query) ?
        bitMasks :
        bitMasks.set(query, 1 << bitMasks.size).get(query),
    fromBitMask = unioned =>
    [
        [...bitMasks.entries()]
            .map(([query, mask]) => (mask & unioned) && query)
            .filter(query => !!query),
        bitMasks.clear()
    ][0],
    QueryProxy = options => given((
        { type, pattern = Empty, keyPath = [], fields = Empty } = options,
        query = { type, pattern, keyPath, fields }) => new Proxy(function(){},
    {
        apply: (_, __, args) => given((
            hasPattern = typeof args[0] === "object",
            nonPatternArgs = hasPattern ? args.slice(1) : args) =>
            QueryProxy
            ({
                type,
                pattern: { ...pattern, ...args[0] },
                keyPath,
                fields:
                {
                    ...fields,
                    ...fromEntries(nonPatternArgs
                        .map(f => toFieldMapping(f)))
                }
            })),
        get: (_, key, self) =>
            key === toObject || key === ":magic" ?
                query :
            key === toPrimitive ?
                () => toBitMask(self) :
            QueryProxy({ type, pattern, fields, keyPath: [...keyPath, key] })
    })),
    Queries = fromEntries(
        ["object", "null", "undefined", "boolean", "number", "string"]
            .map(typename => [typename, QueryProxy({ type: type[typename] })])),
    QuerySet = new Proxy({},
    {
        set: (queries, key, value) => queries[key] =
                (typeof value === "number" ?
                    fromBitMask(value) :
                value && typeof value === "object" ?
                    [QueryProxy(value)] :
                    [value])
                    .map(query => (console.log(query),query[toObject])),
        get: (queries, key) => queries[key],
        ownKeys: queries => Object.keys(queries)
    })) => ({ QuerySet, Query: Queries, toObject: query => query[toObject] }));
