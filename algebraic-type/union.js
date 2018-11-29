const { fNamed, declaration, getTypename, getUnscopedTypename, is } = require("./declaration");

const writable = false;
const enumerable = true;
const configurable = false;
const defineProperty = Object.defineProperty;

const fNameRegExp = /([^=\s]+)\s*=>/;
const fNameParse = f => fNameRegExp.exec(f + "")[1];
const fParseMap = farray => farray
    .map(f => f.prototype ?
        [getUnscopedTypename(f), f] :
        [fNameParse(f), f()]);

const ComponentsSymbol = Symbol("Components");


exports.union = declaration(function union (type, declarations)
{
    const named = fParseMap(declarations);
    const types = named.map(([_, type]) => type);

    const typename = getTypename(type);
    const create = fNamed(`[create ${typename}]`, function()
    {
        throw TypeError(
            `${typename} is a union type and thus cannot be instantiated.`);
    });

    for (const [name, child] of named)
        defineProperty(type, name,
            { writable, enumerable, configurable, value: child });

    const unionIs = fNamed(`[is ${typename}]`,
        value => types.some(type => is(type, value)));
    const serialize = [(value, serialize) =>
        (index => [index, serialize(types[index], value)])
        (types.findIndex(type => is(type, value))), false];
    const deserialize = ([index, serialized], deserialize) =>
        deserialize(types[index], serialized);

    type[ComponentsSymbol] = types;

    return { is: unionIs, create, serialize, deserialize };
});

exports.union.components = function (type)
{
    return type[ComponentsSymbol];
}

/*
const fCreate = (f, properties) =>
    (Object.keys(properties)
        .forEach(key => defineProperty(f, key, { value: properties[key] }), f);
*/

