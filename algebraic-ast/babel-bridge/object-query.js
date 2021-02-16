const { fromEntries } = Object;
const { toPrimitive } = Symbol;
const { data, type, Δ, string }= require("@algebraic/type");
const TRegExp = require("templated-regular-expression");

const given = f => f();

const Empty = Object.freeze(Object.create(null));
const Query = data `Query` (
    type    =>  Function,
    pattern =>  [type.object, Empty],
    keyPath =>  [type.array(string), []],
    mapping =>  [type.object, Empty],
    casting =>  [type.object, Empty] );


const FieldRegExps = TRegExp(
{
    "identifier": /[^\s,}{()]+/,
    "delimiter": /\s*,\s*/,
    "identifier-list": /${identifier}(?:${delimiter}${identifier})*/,
    "arrow": /\s*=>\s*/,
    "composite":
        /^\(\s*\{\s*(${identifier-list})\s*\}\s*\)${arrow}(${identifier})/,
    "single": /(${identifier})${arrow}(${identifier})/
});

const toFieldCasting = f =>
    ({ [(f + "").match(FieldRegExps.identifier)[0]]: f() });

const toFieldMapping = f => given((
    fString = f + "",
    matchSingle = fString.match(FieldRegExps.single),
    matchComposite = !matchSingle && fString.match(FieldRegExps.composite)) =>
({
    [(matchSingle || matchComposite)[2]]: matchSingle ?
        matchSingle[1] :
        matchComposite[1].split(FieldRegExps.delimiter)
}));
Error.stackTraceLimit = 1000000;
module.exports = given((
    casting = Symbol("casting"),
    mapping = Symbol("mapping"),
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
    QueryProxy = query => new Proxy(function(){},
    {
        apply: (_, __, [newPattern]) => 
            QueryProxy(query.Δ(pattern => { if(typeof newPattern !== "object") throw Error();  return newPattern })),

        get: (_, key, self) =>
            key === mapping ? f =>
                QueryProxy(query.Δ(mapping =>
                    ({ ...mapping, ...toFieldMapping(f) }))) :

            key === casting ? f =>
                QueryProxy(query.Δ(casting =>
                    ({ ...casting, ...toFieldCasting(f) }))) :

            key === toObject || key === ":magic" ?
                query :

            key === toPrimitive ?
                () => toBitMask(self) :
    
            QueryProxy(query.Δ(keyPath => keyPath.concat(key)))
    }),
    Queries = fromEntries(
        ["object", "null", "undefined", "boolean", "number", "string"]
            .map(typename => [typename, Query({ type: type[typename] })])
            .map(([typename, query]) => [typename, QueryProxy(query)])),
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
    })) => ({ QuerySet, Query: Queries, mapping, casting, toObject: query => query[toObject] }));
