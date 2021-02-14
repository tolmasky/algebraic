const { fromEntries } = Object;
const { toPrimitive } = Symbol;

const given = f => f();


module.exports = given((
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
    RenameFieldRegExp = /^([^\s=]+)\s*=>\s*([^\s]+)/,
    QueryProxy = options => given((
        { pattern, keyPath = [], rename = [] } = options,
        query = { pattern, keyPath, rename }) => new Proxy(function(){},
    {
        apply: (_, __, args) => given((
            hasPattern = typeof args[0] === "object") =>
            QueryProxy
            ({
                pattern: { ...pattern, ...args[0] },
                keyPath,
                rename: rename
                    .concat((hasPattern ?  args.slice(1) : args)
                        .map(f => (f + "").match(RenameFieldRegExp))
                        .map(([_, from, to]) => [from, to]))
            })),
        get: (_, key, migration) =>
            key === toObject || key === ":magic" ?
                query :
            key === toPrimitive ?
                () => toBitMask(migration) :
                QueryProxy({ pattern, rename, keyPath: keyPath.concat(key) })
    })),
    QuerySet = new Proxy({},
    {
        set: (queries, key, value) =>            
            queries[key] =
                (typeof value === "number" ?
                    fromBitMask(value) :
                    [value])
                .map(query => query[toObject]),
        get: (queries, key) => queries[key],
        ownKeys: queries => Object.keys(queries)
    })) => ({ QuerySet, Query: QueryProxy }));
