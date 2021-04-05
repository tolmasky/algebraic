Error.stackTraceLimit = 1000;

const { isTaggedCall, tagResolve } = require("./templating");


function type(...args)
{
    return isTaggedCall(args) ?
        (...nextArguments) => define(tagResolve(...args), ...nextArguments) :
        define("<anonymous>", ...args);
}

module.exports = type;

function define(name, ...fields)
{
    return product(name, fields);
}

type.of = value =>
    !value || typeof value !== "object" ?
        type[typeof value] :
        Object.getPrototypeOf(value).constructor;

type.belongs = (type, value) =>
(console.log(type, value),
    value instanceof type);

type.has = (T, value) => T.has(value);

type.typename = T => T.name;

const product = require("./product");


const f = require("./function-define");

function primitive(name, has)
{
    return Object.assign(f (name, ()=>{}, type.prototype),
    {
        has: has || (value => typeof value === name)
    });
}

type.bigint = primitive("bigint");
type.boolean = primitive("boolean");
type.function = primitive("function");
type.number = primitive("number");
type.null = primitive("null");
type.string = primitive("string");
type.symbol = primitive("symbol");
type.undefined = primitive("undefined");
type.object = primitive("object", value => value && typeof value === "object");


