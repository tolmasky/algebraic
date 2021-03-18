const fromEntries = require("@climb/from-entries");

const fail = require("../fail");
const template = require("./template");

const given = f => f();

const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, f) =>
    fNamed(name, Object.setPrototypeOf(f, prototype));

const TypeDefine = Symbol("Type.Internal.Define");

const TypeConstruct = Symbol("Type.Internal.Construct");
const TypeAttributes = Symbol("type.attributes");

const construct = (T, properties) =>
    Object.assign(new T(TypeConstruct), properties);
const unsatisfied = () => false;

const newkind = (name, toAttributes) =>
    attributes = toAttributes(construct),
    fNamed()
    K = (name, p
    
     fPrototyped(prototype, name, function (...args),
    {
        return  args[0] === TypeConstruct ? this :
                this instanceof T ?
                    fail.type(`Don't call ${name} with "new".`) :
                template.isTaggedCall(args[0]) ?
                    annotate(T, template.resolve(args)) :
                !apply ?
                    fail.type(`${name} is not a constructable type.`) :
                apply.call(this, T, T, construct, args);
    }) => Object.defineProperty(
        T,
        TypeAttributes,
        { value: { satisfies: unsatisfied, ...attributes } }));

data = kind `type.data` (require())

"Pizza" -> { name, fields }
"type" -> { satisfies, apply }
"type" -> {}



type()

type 
{
    name,
    kind: { apply, satisfies, attributes } 
}

function kind()
{
    
}

type()
{
    name
    [attributes]: { apply, satisfies, ...more };
}

type "Pizza" { name, apply, satisfies, { ...rest } },  
    -> kind = type.data
        -> type<data> ""
    
    kind
    {
        name,
        apply,
        satisfies,
        
    }

const type {  }
{
}

const define = attributes => given((
    T = fPrototyped(
        type.prototype,
        attributes.name,
        function (...args)
        {
            return  args[0] === TypeConstruct ? this :
                    template.isTaggedCall(args[0]) ? modify(T, template.resolve(args)) :
                    !attributes.apply ?
                        fail.type(`${name} is not a constructable type.`) :
                    attributes
                        .apply
                        .call(this, T, T, construct, args);
        })) => Object.defineProperty(
            T,
            TypeAttributes,
            { value: { satisfies: unsatisfied, ...attributes } }));

const NoConfiguration = {};
const toInferredDefinition = configuration =>
    configuration === NoConfiguration ?
        fail.type(`FIXME: unary types not supported yet`) :
    !configuration ?
        fail.type(`Can't configure type with ${configuration}`) :
    typeof configuration === "object" ?
        define(data, 
        toDataAttributes(configuration) :
    // This has to come before the function check, if not it will trigger for
    // that first.
    configuration instanceof type ?
        toAliasAttributes(configuration) :
    typeof configuration === "function" ?
        (console.log("here with...", configuration+""), toFunctionAttributes(configuration)) :
        fail.type(`Can't configure type with ${configuration}`)

const toInferredDefinition = configuration =>
    configuration === NoConfiguration ?
        fail.type(`FIXME: unary types not supported yet`) :
    !configuration ?
        fail.type(`Can't configure type with ${configuration}`) :
    typeof configuration === "object" ?
        define(data
        toDataAttributes(configuration) :
    // This has to come before the function check, if not it will trigger for
    // that first.
    configuration instanceof type ?
        toAliasAttributes(configuration) :
    typeof configuration === "function" ?
        (console.log("here with...", configuration+""), toFunctionAttributes(configuration)) :
        fail.type(`Can't configure type with ${configuration}`)



const modify = (T, operator) =>
    operator === "?" ? nullable(T) :
    operator === "=" ? false /*Field*/ :
    operator === "()=" ? false /*Computed*/ :
    false;

function type(...args)
{
    return template.isTaggedCall(args) ?
        (...rest) => type(template.resolve(...args), ...rest) :
        given((
            isAnonymous = typeof args[0] !== "string",
            hasConfiguration = args.length > (isAnonymous ? 0 : 1)) =>
            define(
            {
                name: isAnonymous ? "anonymous" : args[0],
                ...toInferredDefinition(
                    !hasConfiguration ? NoConfiguration :
                    isAnonymous ? args[0] :
                    args[1])
            }));
};

const kinds = fromEntries(
[
    ["data", require("./kind/data")],
    ["function", require("./kind/function")]
].map(kind));

module.exports = type;

function satisfies(predicate, candidate)
{
    if (predicate === candidate)
        return true;

    const pAttributes = type.attributes(predicate);

    if (pAttributes.satisfies(predicate, candidate))
        return true;

    const cAttributes = type.attributes(candidate);

    return  cAttributes.aliasof &&
            satisfies(predicate, cAttributes.aliasof);
}

type.satisfies = function (T, value)
{//console.log(value, type.of(value), type.of(value)[Definition]);
    return satisfies(T, type.of(value));
}

type.attributes = T => T[TypeAttributes];

type.typename = T => type.attributes(T).name;

type.of = value =>
    type[value === null ? "null" : typeof value] ||
    Object.getPrototypeOf(value).constructor;

Object.assign(
    type,
    fromEntries(
        ["null", "undefined", "number", "string", "boolean"]
            .map(name => [name, define({ name })])));

const toAliasAttributes = aliasof => given((
    aliasofAttributes = type.attributes(aliasof)) =>
({
    aliasof,
    apply:
        aliasofAttributes.apply &&
        function apply(NominalT, _, ...rest)
        {
            return aliasofAttributes
                .apply
                .call(this, NominalT, aliasof, ...rest);
        }
}));


const toDataAttributes = require("./attributes/data");
const toFunctionAttributes = require("./attributes/function");
