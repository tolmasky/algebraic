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

    return { is: unionIs, create };
});

/*
const fCreate = (f, properties) =>
    (Object.keys(properties)
        .forEach(key => defineProperty(f, key, { value: properties[key] }), f);
*/

