const fromEntries = require("@climb/from-entries");
const fail = require("../fail");
const template = require("./template");
const provenancing = require("./provenancing");

const alias = provenancing((name, T) => T, (_, [name]) => name);
const unary = provenancing(() => ({}));

const type = (...arguments) =>
    template.isTaggedCall(arguments) ?
        (...nextArguments) =>
            alias(template.resolve(arguments), type(...nextArguments)) :
    arguments.length === 0 ?
        unary() :
    !arguments[0] ?
        fail(`Can't make new type with ${JSON.stringify(arguments[0])}`) :
    typeof arguments[0] === "object" ?
        data(arguments[0]) :
    typeof arguments[0] === "function" ?
        provenancing(arguments[0]) :
        fail(`Can't make new type with ${JSON.stringify(arguments[0])}`);


const modify = (T, operator) =>
    operator === "?" ? nullable(T) :
    operator === "=" ? false /*Field*/ :
    operator === "()=" ? false /*Computed*/ :
    false;

module.exports = type;

function satisfies(predicate, candidate)
{
    if (predicate === candidate)
        return true;

    return false;
/*
    const pAttributes = type.attributes(predicate);

    if (pAttributes.satisfies(predicate, candidate))
        return true;

    const cAttributes = type.attributes(candidate);

    return  cAttributes.aliasof &&
            satisfies(predicate, cAttributes.aliasof);*/
}

type.satisfies = function (T, value)
{//console.log(value, type.of(value), type.of(value)[Definition]);
    return satisfies(T, type.of(value));
}

const data = require("./data");

type.typename = T => T.name;

type.of = value =>
    type[value === null ? "null" : typeof value] ||
    value["Provenance"] && value["Provenance"].function ||
    Object.getPrototypeOf(value).constructor; 

Object.assign(
    type,
    fromEntries(
        ["null", "undefined", "number", "string", "boolean"]
            .map(name => [name, alias(name,
                provenancing(() =>
                    fail(`Cannot construct objects of type ${name}`)))])));
