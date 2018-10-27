const IsSymbol = Symbol("is");
exports.IsSymbol = IsSymbol;

const TypenameSymbol = Symbol("typename");
exports.TypenameSymbol = TypenameSymbol;

const InspectSymbol = require("util").inspect.custom;

const { hasOwnProperty } = Object.prototype;

exports.typename = function typename(type)
{
    return hasOwnProperty.call(type, TypenameSymbol) ?
        type[TypenameSymbol] : type.name;
};

const defineProperty = Object.defineProperty;
const fNamed = (name, f) =>
    (Object.defineProperty(f, "name", { value: name }), f);

exports.is = function is(...args)
{
    const type = args[0];

    if (args.length === 1)
        return fNamed(`[is ${typename(type)}]`, value => is(args[0], value));

    const is = type[IsSymbol];
    const value = args[1];

    return is ? is(value) : value instanceof args[0];
}

function primitive(typename)
{
    const is = fNamed(`[is ${typename}]`, value => typeof value === typename);
    const toString = () => `[type ${typename}]`;

    return {
        [IsSymbol]: is,
        [TypenameSymbol]: typename,
        [InspectSymbol]: toString,
        toString
    };
}

exports.boolean = primitive("boolean");
exports.number = primitive("number");
exports.string = primitive("string");
exports.regexp = primitive("regexp");

exports.data = require("./data");
exports.union = require("./union");

