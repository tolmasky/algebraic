const { IObject } = require("./intrinsics");
const { constructible } = require("./function-define");
const { isTaggedCall, tagResolve } = require("./templating");

const Definition = Symbol("Definition");
const definition = T => T[Definition];

const type = constructible("type", (_, declaration) =>
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
                value: isUnaryContructor(constructor) ?
                    constructor() :
                    constructor
            }))
    ]),
    (f, property) => property.inherits(Function.prototype));

module.exports = type;

function instantiate(T, tuple, [public_, private_])
{
    const instance = tuple ?
        Object.setPrototypeOf([], T.prototype) :
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
    this.prototoype = options.prototype || false;
    this.has = options.has || false;
    
    return IObject.freeze(this);
}

function TypeDefinition(T, declaration)
{console.log(declaration);
    
    console.log(T + "");
    console.log("---");
    console.log(declaration + "");

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
        defautlConstructor(...args) :
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
        type(new TypeDeclaration({ name, has }));

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
