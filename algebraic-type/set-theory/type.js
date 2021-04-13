Error.stackTraceLimit = 1000;
const fromEntries = require("@climb/from-entries");
const fail = require("./fail");
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
const infer = name => (configuration, ...rest) =>
    configuration === empty ?
        0 : // FIXME: Unary...

    !configuration ?
        fail(`Can't make new type with ${JSON.stringify(configuration)}`) :

    configuration === 22 ?
        define(name, type.attributes(rest[0])) :

    rest.length > 0 ?
        (console.log("HERE WITH ", configuration, rest),define(name, sum(configuration, ...rest))) :

    typeof configuration === "object" ?
        define(name, data(configuration)) :
    typeof configuration === "function" ?
        configuration instanceof type ?
            define(name, sum(configuration)) :
//            define(name, type.attributes(configuration)) :
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
                (T.prototype && (T.prototype.Δ = function (mutation)
    {
        const key = (mutation + "").match(/([^\s=])*/)[0];
        const original = this[key];
        const updated = mutation(original);

        return original === updated ?
            this :
            T({ ...this, [key]: updated });
    }),
                Object.defineProperty(T, "attributes",
                    { value: { satisfies: equals, ...attributes, anonymous: isAnonymous } })));


type.attributes = T => T.attributes;


module.exports = type;


const union = require("./union");

type.union = function(...args)
{
    return  tagged(args,
        name => (...args) => define(name, union(...args)),
        () => define(false, union(...args)));
}

const equals = (lhs, rhs) => lhs === rhs;

type.satisfies = function (predicate, candidate)
{
    return  predicate === type.any ||
            predicate instanceof type ?
                type.attributes(predicate).satisfies(predicate, candidate) :
                predicate === candidate;
}

type.belongs = function (T, value)
{
    return type.satisfies(T, type.of(value));
}

const data = require("./data");
const func = require("./function");

type.typename = T => T.name;

type.any = {};

type.of = value =>
    isArray(value) ? type.array(type.any) :
    value instanceof type ? type :
    typeof value === "object" ? 
        given((prototype = Object.getPrototypeOf(value)) =>
            !prototype || prototype.constructor === Object ?
                type.object :
                prototype.constructor) :
    typeof value === "function" ?
        Function :
    type[value === null ? "null" : typeof value] ||
    type.object;


const primitives = fromEntries(
    ["null", "undefined", "object", "number", "string", "boolean"]
        .map(name => [name, define(name,
            { apply: () => fail(`Cannot construct objects of type ${name}`) })]));


Object.assign(type, primitives);

type.primitives = type.union `primitives` (...Object.values(primitives));

const annotated = require("./annotated");

const modifiers = (T, arguments, alternate) =>
    tagged(arguments, modifier =>
        modifier === "?" ? type.nullable(T)/* `=` (null)*/ :
        modifier === "=" ? value => new annotated(T,  { default: value }) :
        modifier === "()=" ? compute => new annotated(T, { compute }) :
        alternate(modifier),
        /*fail(`Unrecognized modifier: ${modifier} on type ${T.name}`),*/
        alternate);

type.nullable = type `nullable` (T =>
    type.union `(${type.typename(T)})?` (of => T, of => type.null));

const { isArray, prototype: { every } } = Array;
type.array = ItemT => define(`array(${type.typename(ItemT)})`,
{
    ItemT,
    satisfies: (predicate, candidate) => !!type.attributes(candidate).ItemT
    /*isArray(candidate) && every.call(candidate, item => satisfies(ItemT, candidate))*/
});

type.array.item = T => type.attributes(T).ItemT;

type.fields = T => data.fields(T);

const sum = require("./sum");





