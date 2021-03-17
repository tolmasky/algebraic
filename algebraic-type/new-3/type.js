const fromEntries = require("@climb/from-entries");
const fail = require("../fail");
const template = require("./template");
const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, f) =>
    fNamed(name, Object.setPrototypeOf(f, prototype));
const given = f => f();

//const alias = provenancing((name, T) => T, (_, [name]) => name);
//const unary = provenancing(() => ({}));



const anonymous = {};

function type(...arguments)
{
    return  template.isTaggedCall(arguments) ?
                (...nextArguments) =>
                    infer(template.resolve(...arguments), ...nextArguments) :
                infer("anonymous", ...arguments);
}


const empty = {};
const infer = (name, configuration) =>
    configuration === empty ?
        0 : // FIXME: Unary...

    !configuration ?
        fail(`Can't make new type with ${JSON.stringify(configuration)}`) :

    typeof configuration === "object" ?
        define(name, data(configuration)) :
    typeof configuration === "function" ?
        configuration instanceof type ?
            define(name, type.attributes(configuration)) :
            fail(`Not yet implemented: type.function`) :

    fail(`Can't make new type with ${JSON.stringify(configuration)}`);
            /*define(name, f(con*/
        

const Instantiate = {};
const instantiate = (T, ...args) => (console.log(T, args, "wha..."),new T(Instantiate, ...args));

const define = (name, attributes) =>
    given((
        { construct, apply } = attributes,
        T = fPrototyped(
            type.prototype,
            name,
            construct ?           
                function (...args)
                {
                    return  args[0] === Instantiate ?
                            Object.assign(this, args[1]) :
                            (console.log(construct+""),construct.call(this, T, instantiate, attributes, ...args));
                } :
                (...args) => apply(T, ...args))) => Object.assign(T, { attributes }));




type.attributes = T => T.attributes;


module.exports = type;




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
