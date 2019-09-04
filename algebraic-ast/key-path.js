const { of, is, data, union, parameterized, getKind } = require("@algebraic/type");
const { number, string, symbol } = require("@algebraic/type/primitive");
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
    getJust(length - 1, keyPath.child,
        isList(object) ? object.get(keyPath.key) : object[keyPath.key]);

const get = (keyPath, object) =>
    keyPath === KeyPath.Root ? object :
    get(keyPath.child,
        isList(object) ? object.get(keyPath.key) : object[keyPath.key]);

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

const update = (f, keyPath, target) =>
    updateJust(f, keyPath.length, keyPath, target);

const updateJust = (f, length, keyPath, target) =>
    length < 0 ? updateJust(f, keyPath.length + length, keyPath, target) :
    length === 0 ? f(target, keyPath.length > 0 && keyPath) :
    (key =>
        (replacement => isArray(target) ?
            (target = [...target], target[key] = replacement, target) :
            (of(target)({ ...target, [key]: replacement })))
        (updateJust(f, length - 1, keyPath.child, target[key])))
    (keyPath.key);

module.exports.update = update;
module.exports.updateJust = updateJust;

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
        yield iterator.key;
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
// FIXME: Unfortunate.
const isList = (List => value => of(value) === List)(of(List(KeyPath)()));


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
    !value ? None :
    index === keys.length ?
        typeof value === "string" ?
            KeyPathsByName({ [value]: KeyPaths([KeyPath.Root]) }) :
            value :
    !isArray(value) && !isList(value) ?
        inKeyPath(value[keys[index]], keys, index + 1)
            .map(index + 1 < keys.length ? push(keys[index]) : x => x) :
        value
            .map((item, iteration) =>
                inKeyPath(item, keys, index)
                    .map(push(iteration + "")))
            .reduce(take, None);

KeyPathsByName.just = function (name)
{
    return KeyPathsByName({ [name]: KeyPaths([KeyPath.Root]) });
}

KeyPathsByName.concat = function (keyPathsByNames)
{
    return keyPathsByNames.reduce(take, KeyPathsByName.None);
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
