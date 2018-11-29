const { getUUID, getTypename } = require("./declaration");
const { stringify } = JSON;

const TypeConstructorSymbol = Symbol("TypeConstructor");
const ParametersSymbol = Symbol("ParametersSymbol");


function parameterized (internalTypeConstructor)
{
    if (typeof internalTypeConstructor !== "function")
        throw TypeError (
            `\`parameterized\` expects a type constructor ` +
            `function as its sole argument`);

    const cache = Object.create(null);
    const length = internalTypeConstructor.length;

    return function typeConstructor(...types)
    {
        if (types.length !== length)
            throw TypeError(
                `Type constructor takes ${length} types ` +
                `but got only ${types.length}` + internalTypeConstructor);

        const UUID = stringify(types.map(type => getUUID(type)));
        const existing = cache[UUID];

        if (existing)
            return existing;

        const type = cache[UUID] = internalTypeConstructor(...types);

        type[TypeConstructorSymbol] = typeConstructor;
        type[ParametersSymbol] = types;

        return type;
    };
};

module.exports.parameterized = parameterized;

parameterized.is = function (typeConstructor, type)
{
    return type && type[TypeConstructorSymbol] === typeConstructor;
}

parameterized.belongs = function (typeConstructor, value)
{
    if (!value)
        return false;

    const type = Object.getPrototypeOf(value).constructor;

    return parameterized.is(typeConstructor, type);
}

parameterized.parameters = function (type)
{
    const parameters = type &&
        (type[ParametersSymbol] ||
        Object.getPrototypeOf(type).constructor[ParametersSymbol]);

    if (parameters)
        return parameters;

    throw TypeError(`parameters was passed ${type}.`);
}

