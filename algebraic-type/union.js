const { is, IsSymbol, TypenameSymbol, typename } = require("@algebraic/type");
const getTypename = typename;
const InspectSymbol = require("util").inspect.custom;


const fNamed = (name, f) =>
    (Object.defineProperty(f, "name", { value: name }), f);


module.exports = function union ([typename])
{
    return define(typename);
}

const writable = false;
const enumerable = true;
const configurable = false;
const defineProperty = Object.defineProperty;

function define (typename)
{
    return fNamed(`[define ${typename}]`, function (...types)
    {
        const description = { types: false };
        const T = fNamed(typename, function T()
        {
            throw TypeError(
                `${typename} is a union type and thus cannot be instantiated.`);
        });

        for (const type of types)
            defineProperty(T, getTypename(type),
                { writable, enumerable, configurable, value: type });

        T[IsSymbol] = fNamed(`[is ${typename}]`,
            value => types.some(type => is(type, value)));
        T[TypenameSymbol] = typename;
        T[InspectSymbol] = () => `[union ${typename}]`;

        return T;
    });
};

/*
const fCreate = (f, properties) =>
    (Object.keys(properties)
        .forEach(key => defineProperty(f, key, { value: properties[key] }), f);
*/

