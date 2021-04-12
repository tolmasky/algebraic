const { IObject, IArray } = require("./intrinsics");

const fail = require("./fail");
const type = require("./type");
const private = require("./private");
const Field = require("./field");

const { isTaggedCall, tagResolve } = require("./templating");
const f = require("./function-define");
const UseFallbackForEverField = Object.create(null);


module.exports = function Constructible(name, tuple, definitions)
{
    const T = f.constructible(name, function (T, ...args)
    {
        const instantiating = args[0] === instantiate;
        const instantiated = this instanceof T;

        return  instantiating && instantiated ?
                    this :
                !instantiating && instantiated ?
                    fail(
                        `${T} cannot be invoked with "new", ` +
                        `use ${T}(...) instead.`) :
                isTaggedCall(args) ?
                    annotate(tagResolve(...args), T) :
                defaultConstructor ?
                    defaultConstructor(...args) :
                    fail(
                        `Type ${T.name} cannot be used as a constructor.\n` +
                        `Available constructors for type ${T.name} are:` +
                        IObject
                            .values(private(T, "constructors"))
                            .map(({ name }) => `\n  ${name}`));
    },
    type.prototype);

    const constructors = IObject.fromEntries(
        definitions
            .map(definition => Constructor(T, tuple, definition))
            .map(constructor => [constructor.name, constructor]));
    const defaultConstructor =
        IObject.has(name, constructors) ? constructors[name] : false;

    private(T, "constructors", () => constructors);
    private(T, "defaultConstructor", () => defaultConstructor);

    if (tuple)
        IObject.setPrototypeOf(T.prototype, IArray.prototype);

    // We don't want to bother with exposing unary constructors, and instead
    // just want to expose the unary value.
    const assigned = IObject.fromEntries(
        IObject
            .entries(constructors)
            .map(([name, constructor]) =>
            [
                name,
                constructor.isUnaryConstructor ?
                    constructor() :
                    constructor
            ]));

    const defaultValueConstructor = Object
        .values(constructors)
        .find(C => C.isUnaryConstructor);

    private(T, "defaultValue", () =>
        defaultValueConstructor &&
        assigned[defaultValueConstructor.name]);

    return IObject.assignNonenumerable(T,
        assigned,
        { has: value => value instanceof T });
}

function Constructor(T, tuple, definition)
{
    const { name, preprocess, initialize } = definition;
    const C = f(name, (C, ...values) =>
    {
        const [result, preprocessed] = preprocess ?
            preprocess(C, ...values) :
            [false, values];

        return  result ||
                instantiate(
                    T,
                    tuple,
                    initialize(C, process(C, preprocessed)));
    },
    Constructor.prototype);

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
    return private(C, "fields", () =>
        C.fieldDefinitions
            .map(([name, f]) => [name, new Field(f())]));
}

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

function annotate(annotation, T)
{
    if (annotation === "?")
        return type.optional.of(T);

    fail (`Unrecognized annotation: ${annotation} on type ${T}`);
}
