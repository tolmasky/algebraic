const fromEntries = require("@climb/from-entries");

const fail = require("../fail");
const template = require("./template");

const given = f => f();

const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, properties, f) =>
    Object.assign(fNamed(name, Object.setPrototypeOf(f, prototype)), properties);

const TypeDefine = Symbol("Type.Internal.Define");

const TypeConstruct = Symbol("Type.Internal.Construct");
const TypeDefinition = Symbol("Type.Internal.Definition");

const construct = T => new T(TypeConstruct);
const unsatisfied = () => false;

const define = definition => given((
    T = fPrototyped(
        type.prototype,
        definition.name,
        { [TypeDefinition]: {
            satisfies: unsatisfied,
            ...definition
        } },
        function (...args)
        {
            return  args[0] === TypeConstruct ? this :
                    template.isTaggedCall(args[0]) ? modify(T, template.resolve(args)) :
                    !definition.apply ?
                        fail.type(`${name} is not a constructable type.`) :
                    definition
                        .apply
                        .call(this, T, construct, definition, args);
        })) => T);

const NoConfiguration = {};
const toInferredDefinition = configuration =>
    configuration === NoConfiguration ?
        fail.type(`FIXME: unary types not supported yet`) :
    !configuration ?
        fail.type(`Can't configure type with ${configuration}`) :
    typeof configuration === "object" ?
        toDataDefinition(configuration) :
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


module.exports = type;

const satisfies = (criterion, candidate) =>
    criterion === candidate ||
    criterion[TypeDefinition].satisfies(criterion, candidate)/* ||
    candidate instanceof Type.Expression.Invocation &&
    satisfies(criterion, candidate[Definition].effective)*/;

type.satisfies = function (T, value)
{//console.log(value, type.of(value), type.of(value)[Definition]);
    return satisfies(T, type.of(value));
}

type.of = value =>
    type[value === null ? "null" : typeof value] ||
    Object.getPrototypeOf(value).constructor;

Object.assign(
    type,
    fromEntries(
        ["null", "undefined", "number", "string", "boolean"]
            .map(name => [name, define({ name })])));

const toDataDefinition = require("./to-data-definition");
