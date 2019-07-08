const of = require("./of");
const fail = require("./fail");
const has = hasOwnProperty.call.bind(hasOwnProperty);

const { getUUID, getTypename, IsSymbol, is } = require("./declaration");
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
    const typeConstructor = function typeConstructor(...types)
    {
        if (length !== 0 && types.length !== length)
            throw TypeError(
                `Type constructor takes ${length} types ` +
                `but got only ${types.length}`);

        const UUID = stringify(types.map(type => getUUID(type)));
        const existing = cache[UUID];

        if (existing)
            return existing;

        const type = cache[UUID] = internalTypeConstructor(...types);

        type[TypeConstructorSymbol] = typeConstructor;
        type[ParametersSymbol] = types;

        return type;
    };

    typeConstructor[IsSymbol] = value => valueIs(typeConstructor, value);

    return typeConstructor;
};

module.exports.parameterized = parameterized;

// This returns true if, given P<T1,T2,...,TN>:
// type.of(value) is of *some* P
// type.of(value) is of P[type.of(value).parameters]
// The second case is for example:
// P = paramaterized(T => union (X<T>, Y<T>))
// X<T> should intuitively return true for P.
function valueIs(typeConstructor, value)
{
    const type = of(value);
    const isParameterized = has(type, ParametersSymbol);

    if (!isParameterized)
        return false;

    if (type[TypeConstructorSymbol] === typeConstructor)
        return true;

    const length = typeConstructor.length;
    const parameters = type[ParametersSymbol];

    // Can we parameterize with these?
    if (length !== 0 && length !== parameters.length)
        return false;

    return is (typeConstructor(...parameters), value)
}

parameterized.is = function (typeConstructor, type)
{
    return type && type[TypeConstructorSymbol] === typeConstructor;
}

parameterized.belongs = function (typeConstructor, value)
{
    return !value && parameterized.is(typeConstructor, of(value));
}

parameterized.parameters = function (valueOrType)
{
    return valueOrType ?
        (valueOrType[ParametersSymbol] || of(valueOrType)[ParametersSymbol]) :
        fail.type(`Parameters was passed ${type}.`);
}

