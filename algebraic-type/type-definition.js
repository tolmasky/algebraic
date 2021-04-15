const { IObject, IArray } = require("./intrinsics");
const { flat } = IArray.prototype;
const { f, constructible } = require("./function-define");
const { isTaggedCall, tagResolve } = require("./templating");

const Definition = Symbol("Definition");
const definition = T => T[Definition];

const Product = require("./types/product");
const UseFallbackForEverField = IObject.create(null);


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

// FIXME: Check if items in body are all constructors...
const declare = (name, body) =>
    define(new TypeDeclaration(
        /*Sum.test(body) ? Sum(name, body) :
        Product.test(body) ? Product(name, body) :*/
        Product (name, flat.call(body))
/*        fail (`Could not recognize type declaration.`)*/));

function parseBody(name)
{
    return IObject.assignNonenumerable(
        (...body) => type(name, ...body),
        { forall: (...rest) => require("./forall")(name, ...rest) });
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
    (T, property, definition = new TypeDefinition(T, declaration)) =>
    [
        property.prototypeOf (type.prototype),
        declaration.prototype &&
            property.inherits (declaration.prototype),
        property({ name: Definition, value: definition }),
        ...IObject
            .entries(definition.constructors)
            .map(([name, constructor]) => property(
            {
                name,
                enumerable: true,
                value: isUnaryConstructor(constructor) ?
                    constructor() :
                    constructor
            }))
    ]);

function isUnaryConstructor()
{
    return false;
}

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

function TypeDeclaration(options)
{
    this.name = options.name;
    this.invocation = options.invocation || false;
    this.constructorDeclarations = options.constructorDeclarations || [];
    this.prototype = options.prototype || false;
    this.has = options.has || false;
    
    return IObject.freeze(this);
}

function TypeDefinition(T, declaration)
{
    this.name = declaration.name;

    this.invocation = declaration.invocation;

    this.constructors = IObject.fromEntries(
        declaration
            .constructorDeclarations
            .map(declaration => Constructor(T, declaration))
            .map(constructor => [constructor.name, constructor])),

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
            `${name} has no default constructor.` +
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
        define(new TypeDeclaration({ name, has }));

type.bigint = primitive("bigint");
type.boolean = primitive("boolean");
type.function = primitive("function");
type.number = primitive("number");
type.null = primitive("null");
type.string = primitive("string");
type.symbol = primitive("symbol");
type.undefined = primitive("undefined");
type.object = primitive("object", (T, value) => value && typeof value === "object");

type.has = (T, value) => definition(T).has(T, value);


function Constructor(T, definition)
{
    const { name, preprocess, initialize } = definition;
    const C = f(name, (C, ...values) =>
    {
        const [result, preprocessed] = preprocess ?
            preprocess(T, C, values) :
            [false, values];

        return  result ||
                instantiate(
                    T,
                    initialize(C, process(C, preprocessed)));
    },
    (_, property) => property.prototypeOf (Constructor.prototype));

    const
    {
        hasPositionalFields,
        fieldDefinitions,
        isUnaryConstructor
    } = definition;

    return IObject.assign(C,
        { hasPositionalFields, fieldDefinitions, isUnaryConstructor });
}

function process(C, preprocessed)
{
    const { hasPositionalFields } = C;
    if (!hasPositionalFields && preprocessed.length > 1)
        fail (
            `Too many arguments passed to ${C.name}.\n` +
            `${C.name} is a record constructor and thus expects ` +
            `one object argument.`);

    const fields = toFields(C);

    if (hasPositionalFields && preprocessed.length > fields.length)
        fail (
            `Too many arguments passed to ${C.name}.\n`
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

function toFields(C)
{
    return [];
}


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


        property.prototypeOf (type.prototype),
        property.inherits (declaration.prototype),
        property.nonenumerable(Definition, definition),
        ...IObject
            .entries(definition.constructors)
            .map(([name, constructor]) => property.enumerable(
                name,
                isUnaryContructor(constructor) ?
                    constructor() :
                    constructor))

*/
