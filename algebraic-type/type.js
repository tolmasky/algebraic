Error.stackTraceLimit = 10000;

const { IObject, IArray } = require("./intrinsics");
const { flat } = IArray.prototype;
const { f, constructible } = require("./function-define");
const { isTaggedCall, tagResolve } = require("./templating");
const fail = require("./fail");

const Definition = Symbol("Definition");
const definition = T => T[Definition];

const private = require("./private");
const UseFallbackForEverField = IObject.create(null);

const isObject = value => value && typeof value === "object";
const isFunction = value => typeof value === "function";


const type = constructible("type", (_, ...arguments) =>

    // Case 0: type() -> ERROR
    arguments.length < 1 ?
        fail (`type() cannot be called with no arguments.`) :

    // Case 1: type `[...]` -> ((...body) -> T)
    isTaggedCall(arguments) ?
        parseBody(tagResolve(...arguments)) :

    // Case 2: type (...body) -> T
    typeof arguments[0] !== "string" ?
        declare("", arguments) :

    // Case 3: type (string) -> ((...body) -> T)
    arguments.length === 1 ?
        parseBody(arguments[0]) :

    // Case 4: type (string, ...body) -> T
    declare(arguments[0], arguments.slice(1)),

    (f, property) => property.inherits(Function.prototype));

IObject.defineProperty(type, "type", { value: type });

type.definition = definition;

// FIXME: Generalize this...
type.of = type.of = value =>
    !value || typeof value !== "object" ?
        type[typeof value] :
        Object.getPrototypeOf(value).constructor;

const declare = (name, body, flatBody = flat.call(body)) =>
    define(
        isSumBody(flatBody) ? Sum (name, flatBody) :
        isProductBody(flatBody) ? Product (name, flatBody) :
        fail (`Could not recognize type declaration.`));

function parseBody(name)
{
    return IObject.assignNonenumerable(
        (...body) => type(name, ...body),
        { forall: (...rest) => forall(name, ...rest) });
}

const define = declaration =>
    constructible(declaration.name, function (T, ...args)
    {
        const instantiating = args[0] === instantiate;
        const instantiated = this instanceof T;

        return  instantiating && instantiated ?
                    this :
                !instantiating && instantiated ?
                    failCannotBeInvokedWithNew(T) :
                isTaggedCall(args) ?
                    annotate(tagResolve(...args), T) :
                tryDefaultConstructor(T, args);
    },
    (T, property, TDefinition = new TypeDefinition(T, declaration)) =>
    [
        declaration.onPrototype &&
            property.onPrototype(declaration.onPrototype),
        property.prototypeOf (type.prototype),
        declaration.inherits &&
            property.inherits (declaration.inherits),
        property({ name: Definition, value: TDefinition }),
        ...IObject
            .entries(TDefinition.constructors)
            .map(([name, constructor]) => property(
            {
                name,
                enumerable: true,
                value: definition(constructor).isUnaryConstructor ?
                    constructor() :
                    constructor
            }))
    ]);

module.exports = type;

function instantiate(T, [public_, private_])
{
    const instance =
        T.prototype instanceof Array ?
            IObject.setPrototypeOf([], T.prototype) :
            new T(instantiate);

    IObject
        .entries(private_ || {})
        .map(([name, value]) => private(instance, name, () => value));

    return IObject.freeze(IObject.assign(instance, public_));
}

function TypeDefinition(T, declaration)
{
    this.name = declaration.name || "";

    this.invocation = declaration.invocation || false;

    this.constructors = IObject.fromEntries(
        (declaration.constructors || [])
            .map((declaration, ID) => Constructor(T, ID, declaration))
            .map(constructor => [constructor.name, constructor]));

    const count = IObject.keys(this.constructors).length;

    this.EveryCID = [(1 << count) - 1];

    this.defaultConstructor =
        IObject.has(this.name, this.constructors) ?
            this.constructors[this.name] :
            false,

    this.has = declaration.has || ((T, value) => value instanceof T);

    this.toDefaultValue = declaration.toDefaultValue;

    return IObject.freeze(this);
}

function tryDefaultConstructor(T, args)
{
    const { defaultConstructor, constructors } = definition(T);

    return defaultConstructor ?
        defaultConstructor(...args) :
        fail(
            `${T.name} has no default constructor.` +
            (constructors.length <= 0 ?
            "" :
            `\nAvailable constructors are:${
                IObject
                    .values(constructors)
                    .map(({ name }) => `\n  ${name}`)}`));
}

// FIXME: Do something if constructors.length === 0
const failCannotBeInvokedWithNew = T =>
    fail(
        `${T.name} cannot be invoked with "new", ` +
        `use ${T.name}(...) instead.`);

const primitive =
    (name, has = (T, value) => typeof value === name) =>
        define({ name, has });

type.bigint = primitive("bigint");
type.boolean = primitive("boolean");
type.function = primitive("function");
type.number = primitive("number");
type.null = primitive("null");
type.string = primitive("string");
type.symbol = primitive("symbol");
type.undefined = primitive("undefined");
type.object = primitive("object", (T, value) => value && typeof value === "object");

const has = (T, ...rest) =>
    rest.length === 0 ?
        value => has(T, value) :
        definition(T).has(T, rest[0]);

type.has = has;

type.typename = T => T.name;//definition(T).name;

function Constructor(T, ID, declaration)
{
    const { name, preprocess, fields } = declaration;
    const initialize = declaration.initialize || ((C, fields) => [fields]);

    const hasNamedFields = fields.length === 1 && isObject(fields[0]);
    const hasPositionalFields = !hasNamedFields && fields.every(isFunction);

    if (!hasNamedFields && !hasPositionalFields)
        fail (
            `Unrecognized field declarations for constructor ${name}:` +
            JSON.stringify(fields));

    return f(name, (C, ...values) =>
    {
        const [result, preprocessed] = preprocess ?
            preprocess(T, C, values) :
            [false, values];

        return  result ||
                instantiate(
                    T,
                    initialize(C, process(C, preprocessed)));
    },
    (_, property) =>
    [
        property.prototypeOf (Constructor.prototype),
        property({ name: "ID", value: ID }),
        property({ name: Definition, value:
        {
            name,
            initialize,
            hasPositionalFields,
            isUnaryConstructor:
                hasPositionalFields && fields.length === 0,
            fieldDefinitions: IObject
                .entries(hasNamedFields ? fields[0] : fields)
        } })
    ]);
}

function process(C, preprocessed)
{
    const { hasPositionalFields } = definition(C);
    if (!hasPositionalFields && preprocessed.length > 1)
        fail (
            `Too many arguments passed to ${C.name}.\n` +
            `${C.name} is a record constructor and thus expects ` +
            `one object argument.`);

    const fields = getFields(C);

    if (hasPositionalFields && preprocessed.length > fields.length)
        fail (
            `Too many arguments passed to ${C.name}.\n` +
            `${C.name} is a positional constructor that expects no more than` +
            `${fields.length} arguments.`);

    const flattened =
        preprocessed.length <= 0 ?
            UseFallbackForEverField :
        hasPositionalFields ?
            preprocessed :
            preprocessed[0];

    return IObject
        .fromEntries(fields
            .map(([name, field]) =>
                [name, field.extract(C, name, flattened)]));
}

function getFields(C)
{
    return private(C, "fields", () =>
        C[Definition].fieldDefinitions
            .map(([name, f]) => [name, Field(f())]));
}

function annotate(annotation, T)
{
    if (annotation === "?")
        return Optional.of(T);

    if (annotation === "=")
        return defaultValue => Field({ type: T, defaultValue });

    fail (`Unrecognized annotation: ${annotation} on type ${T}`);
}

type.fallback = function fallback(toDefaultValue)
{
    return f `fallback` (
        (f, ...args) => toDefaultValue(...args),
        (_, property) => property.prototypeOf (fallback.prototype));
}

const { isProductBody, Product } = require("./types/product");
const { isSumBody, Sum, caseof } = require("./types/sum");

type.caseof = caseof;

const Field = require("./field");
const forall = require("./types/forall");
const Optional = require("./types/optional");

type.Optional = Optional;



/*
IObject.assign(type,
    IObject.fromEntries(
        require("./primitives")
            .map(([name, has]) =>
                type(new TypeDefinition({ name, has })))));

IObject.assign(
    type,
    IObject.fromEntries(...
        ["bigint", "boolean", "function", "number", "string", "symbol", "undefined"]
            .map(name => [name, primitive])));
*/


