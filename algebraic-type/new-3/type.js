const fromEntries = require("@climb/from-entries");
const fail = require("../fail");
const { tagged } = require("./template");
const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, f) =>
    fNamed(name, Object.setPrototypeOf(f, prototype));
const given = f => f();

//const alias = provenancing((name, T) => T, (_, [name]) => name);
//const unary = provenancing(() => ({}));



const anonymous = {};

function type(...args)
{
    return tagged(args, infer, () => infer(false)(...args));
};

Object.setPrototypeOf(type.prototype, Function.prototype);


const empty = {};
const infer = name => configuration =>
    configuration === empty ?
        0 : // FIXME: Unary...

    !configuration ?
        fail(`Can't make new type with ${JSON.stringify(configuration)}`) :

    typeof configuration === "object" ?
        define(name, data(configuration)) :
    typeof configuration === "function" ?
        configuration instanceof type ?
            define(name, type.attributes(configuration)) :
            define(name, func(configuration)) :

    fail(`Can't make new type with ${JSON.stringify(configuration)}`);
            /*define(name, f(con*/

const Instantiate = {};
const instantiate = (T, ...args) => new T(Instantiate, ...args);

const define = (name, attributes) => given((
    { construct, apply } = attributes,
    isAnonymous = !name,
    T = fPrototyped(
        type.prototype,
        isAnonymous ? "anonymous" : name,
        construct ?
            function (...args)
            {
                return  modifiers(T, args, () =>
                    args[0] === Instantiate ?
                    Object.assign(this, args[1]) :
                    construct.call(this, T, instantiate, attributes, ...args));
            } :
            (...args) => modifiers(T, args, () => apply(T, attributes, ...args)))) =>
                Object.defineProperty(T, "attributes", { value: { ...attributes, anonymous: isAnonymous } }));


type.attributes = T => T.attributes;


module.exports = type;


const union = require("./union");

type.union = function(...args)
{
    return  tagged(args, name => (...args) => define(name, union(...args))) ||
            define(false, union(...args));
}

function satisfies(predicate, candidate)
{
    if (predicate === type.any)
        return true;

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
const func = require("./function");

type.typename = T => T.name;

type.any = {};

type.of = value =>
    type[value === null ? "null" : typeof value] ||
    Object.getPrototypeOf(value).constructor;

Object.assign(
    type,
    fromEntries(
        ["null", "undefined", "number", "string", "boolean"]
            .map(name => [name, define(name,
                { apply: () => fail(`Cannot construct objects of type ${name}`) })])));

const modifiers = (T, arguments, alternate) =>
    tagged(arguments, modifiers => type.nullable(T), alternate);

type.nullable = type `nullable` (T =>
    type.union `(${type.typename(T)})?` (of => T, of => type.null));


