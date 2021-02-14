const { fromEntries } = Object;
const { toPrimitive } = Symbol;

const BabelTypes = require("@babel/types").TYPES.concat("null");

const given = f => f();

module.exports = given((
    bitMasks = new Map(),
    toBitMask = migration => bitMasks.has(migration) ?
        bitMasks :
        bitMasks.set(migration, 1 << bitMasks.size).get(migration),
    fromBitMask = unioned => 
    [
        [...bitMasks.entries()]
            .map(([migration, mask]) => (mask & unioned) && migration)
            .filter(migration => !!migration),
        bitMasks.clear()
    ][0],
    RenameFieldRegExp = /^([^\s=]+)\s*=>\s*([^\s]+)/,
    Migration = description => given((
        { match, keyPath, rename } = description) => new Proxy(function(){},
    {
        apply: (_, __, args) => given((
            hasPattern = typeof args[0] === "object") =>
            Migration
            ({
                match: { ...match, ...args[0] },
                keyPath,
                rename: (hasPattern ?  args.slice(1) : args)
                    .map(f => (f + "").match(RenameFieldRegExp))
                    .map(([_, from, to]) => [from, to])
            })),
        get: (_, key, migration) =>
            key === "description" ?
                description :
            key === toPrimitive ?
                () => toBitMask(migration) :
                Migration({ match, rename, keyPath: [...keyPath || [], key] })
    })),
    Babel = fromEntries(BabelTypes
        .map(type => [type, Migration({ match: { type } })])),
    Node = new Proxy({},
    {
        set: (migrations, key, value) =>            
            migrations[key] =
                (typeof value === "number" ?
                    fromBitMask(value) :
                    [value])
                .map(({ description }) => description),
        get: (migrations, key) => migrations[key],
        ownKeys: migrations => Object.keys(migrations)
    })) => ({ Babel, Node }));
