Error.stackTraceLimit = 1000;

const { isTaggedCall, tagResolve } = require("./templating");


function type(...args)
{
    return isTaggedCall(args) ?
        (...nextArguments) => define(tagResolve(...args), ...nextArguments) :
        define("<anonymous>", ...args);
}

module.exports = type;

function define(name, definition)
{
    return product(name, definition);
}

type.of = value =>
    Object.getPrototypeOf(value).constructor;

type.belongs = (type, value) =>
(console.log(type, value),
    value instanceof type);

type.typename = T => T.name;

const product = require("./product");