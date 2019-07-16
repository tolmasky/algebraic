const { data, string, union } = require("@algebraic/type");
const { Map, List } = require("@algebraic/collections");

const KeyPath = union `KeyPath` (
    data `Root` (),
    data `Parent` (
        key     => string,
        child   => [KeyPath, KeyPath.Root] ) );

module.exports = KeyPath;

const KeyPaths = List(KeyPath);
const KeyPathsByName = Map(string, KeyPaths);
const None = KeyPathsByName();

module.exports.KeyPath = KeyPath;
module.exports.KeyPathsByName = KeyPathsByName;

KeyPath.Root.prototype[Symbol.iterator] =
KeyPath.Parent.prototype[Symbol.iterator] = function * ()
{
    var iterator = this;

    while (!is(KeyPath.Root, iterator))
    {
        yield JSON.stringify(iterator.key);
        iterator = iterator.child;
    }
}

KeyPath.Root.prototype.toString =
KeyPath.Parent.prototype.toString = function ()
{
    return `[${Array.from(this).join(", ")}]`;
}

const fNameRegExp = /([^=\s]+)\s*=>/;
const fNameParse = f => fNameRegExp.exec(f + "")[1];
const has = hasOwnProperty.call.bind(hasOwnProperty);

const { field } = data;
const { isArray } = Array;

const push = (...keys) =>
    keyPaths =>
        keyPaths.map(keyPath => keys
            .reduceRight((child, key) =>
                KeyPath.Parent({ key, child }), keyPath));

const inKeyPath = (value, keys, index = 0) =>
    index === keys.length ?
        typeof value === "string" ?
            KeyPathsByName({ [value]: KeyPaths([KeyPath.Root]) }) :
            value :
        (child =>
            !child ? None :
            !isArray(child) ?
                inKeyPath(child, keys, index + 1)
                    .map(push(keys[index])) :
            child.reduce((keyPathsByName, item, location) =>
                inKeyPath(item, keys, index + 1)
                    .map(push(keys[index], location + ""))
                    .reduce((accum, keyPaths, name) =>
                        accum.update(name, KeyPaths(), 
                            existing => existing.concat(keyPaths)),
                        keyPathsByName),
                    None))(value[keys[index]]);


KeyPathsByName.compute = function (...shorthandOperations)
{
    const take = (accum, taken, key) =>
        accum.concat(taken.map(value => KeyPath.Parent(key, value)));
    const subtract = (accum, subtracted) =>
        accum.filter(name => subtracted.has(name));
    const methods = { take, subtract };

    const operations = shorthandOperations
        .map(shorthand =>
            [toMethod(fNameParse(shorthand)), shorthand()])
        .map(([method, item]) =>
            typeof item === "string" ?
                { method, keys: item.split(".") } :
                { method, items: item });
    const dependencies = operations
        .filter(operation => has(operation, "keys"))
        .map(({ keys }) => keys[0]);
    const compute = values => operations.reduce(
        (accum, { items, keys, method }) =>
            methods[method](accum, keys ? inKeyPath(values, keys) : items),
        None);

    return field.definition(type).computed({ dependencies, compute });
}

KeyPathsByName.compute.empty = function empty()
{
    return [KeyPathsByName, () => KeyPathsByName()];
}
