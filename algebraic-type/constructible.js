const { IObject, IArray } = require("./intrinsics");

const fail = require("./fail");
const type = require("./type");
const private = require("./private");
const Field = require("./field");

const { isTaggedCall, tagResolve } = require("./templating");
const f = require("./function-define");
const UseFallbackForEverField = Object.create(null);

const annotate = () => false;


module.exports = function constructible(name, tuple, definitions)
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
                    annotate(T, args) :
                defaultConstructor ?
                    defaultConstructor(...args) :
                    fail(
                        `Type ${T.name} cannot be used as a constructor.\n` +
                        `Available constructors for type ${T.name} are:` +
                        private(T, "constructors")
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

    return IObject.assignNonenumerable(T,
        constructors,
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
                    initialize(process(C, tuple, preprocessed)));
    },
    Constructor.prototype);

    const { hasPositionalFields, fieldDefinitions } = definition;

    return IObject.assign(C, { hasPositionalFields, fieldDefinitions });
}

function process(C, tuple, preprocessed)
{
    if (!tuple && preprocessed.length > 1)
        fail (
            `Too many arguments passed to ${C.name}.\n` +
            `${C.name} is a record constructor and thus expects ` +
            `one object argument.`);

    const fields = toFields(C);

    if (tuple && preprocessed.length > fields.length)
        fail (
            `Too many arguments passed to ${C.name}.\n`
            `${C.name} is a positional constructor that expects no more than` +
            `${fields.length} arguments.`);

    const flattened =
        preprocessed.length <= 0 ?
            UseFallbackForEverField :
        tuple ?
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

function instantiate(T, tuple, properties)
{
    const instance = tuple ?
        Object.setPrototypeOf([], T.prototype) :
        new T(instantiate);

    return IObject.freeze(IObject.assign(instance, properties[0]));
}

