const { of, is, data, number, string, union } = require("@algebraic/type");
const { Map, List } = require("@algebraic/collections");

const KeyPath = union `KeyPath` (
    data `Root` (),
    data `Parent` (
        key         => string,
        child       => [KeyPath, KeyPath.Root],
        ([length])  => [number, child => child.length + 1]) );

KeyPath.Root.length = 0;

module.exports = KeyPath;

const KeyPaths = List(KeyPath);
const KeyPathsByName = Map(string, KeyPaths);
const None = KeyPathsByName();

module.exports.KeyPath = KeyPath;
module.exports.KeyPathsByName = KeyPathsByName;
module.exports.KeyPathsByName.None = KeyPathsByName();

const getJust = (length, keyPath, object) =>
    length < 0 ? getJust(keyPath.length + length, keyPath, object) :
    length === 0 ? [object, keyPath] :
    getJust(length - 1, keyPath.child, object[keyPath.key]);

const get = (keyPath, object) =>
    keyPath === KeyPath.Root ? object :
    get(keyPath.child, object[keyPath.key]);

const set = (keyPath, object, item) =>
    keyPath === KeyPath.Root ? item :
    (item => isArray(object) ?
        (object = [...object], object[keyPath.key] = item, object) :
        (of(object)({ ...object, item })))
    (set(keyPath.child, object[keyPath.key], item))

const setJust = (length, keyPath, item, object) =>
    length < 0 ? setJust(keyPath.length + length, keyPath, item, object) :
    length === 0 ? item :
    (item => isArray(object) ?
        (object = [...object], object[keyPath.key] = item, object) :
        (of(object)({ ...object, [keyPath.key]: item })))
    (setJust(length - 1, keyPath.child, item, object[keyPath.key]));

module.exports.get = get;
module.exports.getJust = getJust;

module.exports.set = set;
module.exports.setJust = setJust;

const equalsJust = (length, lhs, rhs) =>
    length < 0 ? equalsJust(lhs.length - length, lhs, rhs) :
    length === 0 ? true :
    lhs.key === rhs.key && equalsJust(length - 1, lhs.child, rhs.child);

module.exports.equalsJust = equalsJust;

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

const at = (keyPath, index) =>
    index < 0 ? at(keyPath, keyPath.length + index) :
    index === 0 ? keyPath.key :
    at(keyPath.child, index - 1);

KeyPath.at = at;

KeyPath.Root.prototype.toString =
KeyPath.Parent.prototype.toString = function ()
{
    return `@[${Array.from(this).join(", ")}]`;
}

const fNameRegExp = /([^=\s]+)\s*=>/;
const fNameParse = f => fNameRegExp.exec(f + "")[1];
const has = hasOwnProperty.call.bind(hasOwnProperty);

const { field } = data;
const { isArray } = Array;

const push = (...keys) => keyPaths =>
    keyPaths.map(keyPath => keys
        .reduceRight((child, key) =>
            KeyPath.Parent({ key, child }), keyPath));
const take = (lhs, rhs) =>
    lhs.size === 0 ? rhs :
    rhs.size === 0 ? lhs :
    rhs.reduce((accum, keyPaths, name) =>
        accum.update(name, KeyPaths(),
            existing => existing.concat(keyPaths)),
        lhs);

const inKeyPath = (value, keys, index = 0) =>
    (child =>
        !child ? None :
        index === keys.length - 1 ?
            typeof child === "string" ?
                KeyPathsByName({ [child]: KeyPaths([KeyPath.Root]) }) :
                child :
        !isArray(child) ?
            inKeyPath(child, keys, index + 1).map(push(keys[index])) :
            child
                .map((item, iteration) =>
                    inKeyPath(item, keys, index + 1)
                        .map(push(keys[index], iteration + "")))
                .reduce(take, None))(value[keys[index]]);



KeyPathsByName.just = function (name)
{
    return KeyPathsByName({ [name]: KeyPaths([KeyPath.Root]) });
}

KeyPathsByName.compute = function (...shorthandOperations)
{
    const subtract = (accum, subtracted) =>
        accum.filter((_, name) => !subtracted.has(name));
    const methods = { take, subtract };

    const operations = shorthandOperations
        .map(shorthand =>
            [fNameParse(shorthand), shorthand()])
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

    return field.definition(KeyPathsByName).computed({ dependencies, compute });
}

KeyPathsByName.compute.empty = function empty()
{
    return [KeyPathsByName, () => KeyPathsByName()];
}
