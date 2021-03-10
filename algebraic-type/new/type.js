const fromEntries = require("@climb/from-entries");

const fail = require("../fail");
const template = require("./template");

const given = f => f();

const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, properties, f) =>
    Object.assign(fNamed(name, Object.setPrototypeOf(f, prototype), properties));
    
const TypeDefine = Symbol("Type.Internal.Define");

const TypeConstruct = Symbol("Type.Internal.Construct");
const TypeDefinition = Symbol("Type.Internal.Definition");

const construct = T => new T(TypeConstruct);

const define = definition => given((
    T = fPrototyped(
        type.prototype,
        definition.name,
        { [TypeDefinition]: definition },
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
    criterion === candidate /*||
    criterion[Definition].satisfies(criterion, candidate) ||
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

/*



type.satisfies = () => true;
const EmptyArguments = Object.freeze(Object.create(null));
const data = Object.assign(fFields =>
({
    fFields,
    construct: (NominalT, self, [values]) =>
        values instanceof NominalT ? value :
        Object.assign(
            data.instantiate(NominalT, self),
            data.normalized({ fFields }, values || EmptyArguments))        
}),
{
    instantiate: (NominalT, self) =>
        self instanceof NominalT ?
            self :
            new NominalT(TypeConstruct),
    normalized: (definition, values) => Object
        .fromEntries(data
        .toFields(definition)
        .map(([key, FieldT]) => given((
            value = values[key],
            fields = data.toFields(definition)) =>
            [
                key,
                type.satisfies(FieldT, values[key]) ?
                    value :
                    fail.type(typecheck(
                        definition.name,
                        key,
                        type.name(FieldT),
                        value))
            ]))),
    toFields: definition =>
        definition.fields ?
            definition.fields :
            definition.fields = Object
                .entries(definition.fFields)
                .map(([key, value]) => [key, value()])
});



        
type.of = value =>
    type[value === null ? "null" : typeof value] ||
    Object.getPrototypeOf(value).constructor;



*/



