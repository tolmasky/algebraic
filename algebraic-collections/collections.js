const { declare, getTypename, parameterized } = require("@algebraic/type");
const { List, OrderedMap, Map, Set, OrderedSet, Stack, Seq } = require("immutable");
const inspect = Symbol.for("nodejs.util.inspect.custom");


exports.List = parameterized (T =>
    toImmutableBridge(List, List.isList, T));
exports.OrderedMap = parameterized ((K, V) =>
    toImmutableBridge(OrderedMap, OrderedMap.isOrderedMap, K, V));
exports.Map = parameterized ((K, V) =>
    toImmutableBridge(Map, Map.isMap, K, V));
exports.Set = parameterized (T =>
    toImmutableBridge(Set, Set.isSet, T));
exports.OrderedSet = parameterized (T =>
    toImmutableBridge(OrderedSet, OrderedSet.isOrderedSet, T));
exports.Stack = parameterized (T =>
    toImmutableBridge(Stack, Stack.isStack, T));
exports.Seq = parameterized (T =>
    toImmutableBridge(Seq, Seq.isSeq, T));


function toImmutableBridge(constructor, is, ...types)
{
    if (!is)
        throw TypeError(constructor.name + " must provide an is function.");

    if (!constructor.prototype[inspect])
        constructor.prototype[inspect] = constructor.prototype.toString;

    const basename = getTypename(constructor);
    const typename = `${basename}<${types.map(getTypename).join(", ")}>`;
    const create = constructor;
    const serialize = [types.length === 1 ?
        (value, serialize) =>
            value.toArray().map(value => serialize(types[0], value)) :
        (value, serialize) =>
            value.entrySeq().toArray().map(([key, value]) =>
                [serialize(types[0], key), serialize(types[1], value)]),
        false];
    const deserialize = types.length === 1 ?
        (serialized, deserialize) => type(serialized.map(serialized =>
            deserialize(types[0], serialized))) :
        (serialized, deserialize) => type(serialized.map(([key, value]) =>
            [deserialize(types[0], key), deserialize(types[1], value)]));
    const type = declare({ typename, create, is, serialize, deserialize });

    for (const key of Object.keys(constructor))
        type[key] = constructor[key];

    return type;
}
