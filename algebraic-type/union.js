const { fNamed, declaration, getTypename, getUnscopedTypename, is } = require("./declaration");

const writable = false;
const enumerable = true;
const configurable = false;
const defineProperty = Object.defineProperty;

exports.union = declaration(function union (type, types)
{
    const description = { types: false };
    const typename = getTypename(type);
    const create = fNamed(`[create ${typename}]`, function()
    {
        throw TypeError(
            `${typename} is a union type and thus cannot be instantiated.`);
    });

    for (const child of types)
        defineProperty(type, getUnscopedTypename(child),
            { writable, enumerable, configurable, value: child });

    const unionIs = fNamed(`[is ${typename}]`,
        value => types.some(type => is(type, value)));
    const serialize = [(value, serialize) =>
        (index => [index, serialize(types[index], value)])
        (types.findIndex(type => is(type, value))), false];
    const deserialize = ([index, serialized], deserialize) =>
        deserialize(types[index], serialized);

    return { is: unionIs, create, serialize, deserialize };
});

/*
const fCreate = (f, properties) =>
    (Object.keys(properties)
        .forEach(key => defineProperty(f, key, { value: properties[key] }), f);
*/

