const given = f => f();
const template = given((
    { hasOwnProperty } = Object,
    { isArray } = Array,
    { reduce } = Array.prototype) =>
({
    isTaggedCall: (args) =>
        isArray(args) &&
        isArray(args[0]) &&
        hasOwnProperty.call(args[0], "raw"),
    resolve: (strings, ...arguments) => reduce.call(
        arguments,
        (string, argument, index) =>
            string + argument + strings[index + 1],
        strings[0])
}));

const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, properties, f) =>
    Object.assign(fNamed(name, Object.setPrototypeOf(f, prototype), properties));
    
const TypeDefine = Symbol("Type.Internal.Define");
const TypeConstruct = Symbol("Type.Internal.Construct");
const TypeDefinition = Symbol("Type.Internal.Definition");

const fail = () => { throw "yikes!" };

function type(...args)
{
    return template.isTaggedCall(args) ?
        (...rest) => type(template.resolve(...args), ...rest) :
        given((
            anonymous = typeof args[0] !== "string",
            name = anonymous ? "anonymous" : args[0],
            hasConfiguration = args.length > (anonymous ? 0 : 1),
            configuration = anonymous ? args[0] : args[1]) =>
            define(name,
                !hasConfiguration ? data :
                !configuration ? fail() :
                typeof configuration === "object" ? data(configuration) :
                fail()));
}

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


const define = (name, definition) => given((
    T = fPrototyped(
        type.prototype,
        name,
        { [TypeDefinition]: { ...definition, name } },
        function (...args)
        {
            return  args[0] === TypeConstruct ? this :
                    template.isTaggedCall(args[0]) ? modify(T, template.resolve(args)) :
                    !definition.construct ? fail() :
                    definition.construct(T, this, args);
        })) => T);
        
type.of = value =>
    type[value === null ? "null" : typeof value] ||
    Object.getPrototypeOf(value).constructor;

Object.assign(
    type,
    Object.fromEntries(
        ["null", "undefined", "number", "string", "boolean"]
            .map(name => [name, type(name)])));


const modify = (T, operator) =>
    operator === "?" ? nullable(T) :
    operator === "=" ? false /*Field*/ :
    operator === "()=" ? false /*Computed*/ :
    false;


