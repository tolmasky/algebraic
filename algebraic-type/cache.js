const given = f => f();

module.exports = () => given((
    start = new WeakMap(),
    ValueKey = Symbol("value"),
    set = (map, key, fValue, value = fValue()) => (map.set(key, value), value),
    getset =  (map, key, fValue) => map.has(key) ? map.get(key) : set(map, key, fValue),
    cache = (map, args, index, miss) => 
        index === args.length ?
            getset(map, ValueKey, miss) :
            cache(
                getset(map, args[index], () => new WeakMap()),
                args, index + 1, miss)) =>
        (args, miss) => cache(start, args, 0, miss));
