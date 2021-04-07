Error.stackTraceLimit = 1000;

const { IObject } = require("./intrinsics");
const { isTaggedCall, tagResolve } = require("./templating");

function type(...args)
{
    return  isTaggedCall(args) ?
                productOrSum(tagResolve(...args)) :
            typeof args[0] === "function" ?
                typef(args[0]) :
                product("<anonymous>", args);
}

const productOrSum = name => IObject.assign(
    (...fields) => product(name, fields),
    { case: sum.case(name) });


module.exports = type;

type.of = value =>
    !value || typeof value !== "object" ?
        type[typeof value] :
        Object.getPrototypeOf(value).constructor;

type.belongs = (type, value) =>
    value instanceof type;

type.has = (T, value) => T.has(value);

type.typename = T => T.name;

const product = require("./product");
const sum = require("./sum");
const typef = require("./function");


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

type.optional = type(T =>
    type `optional(${T.name})`
        .case `some` (of => T)
        .case `none` ());



