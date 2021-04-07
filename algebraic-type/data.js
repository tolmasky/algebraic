const { IObject, IArray } = require("./intrinsics");
const { isTaggedCall, tagResolve } = require("./templating");
const f = require("./function-define");

const construct =
    (T, initializer, args) =>
        IObject.freeze(initializer(T, args));
const instantiate = T => new T(instantiate);
const annotate = () => false;
const private = require("./private");
const Field = require("./field");
const fail = require("./fail");
const UseFallbackForEveryField = { };


function algebraic(name, initializers)
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

    const constructors = IObject.fromEntries(initializers
        .map(initializer =>
        [
            initializer.name,
            f (initializer.name, (f, ...args) => construct(T, initializer, args))
        ]));

    const defaultConstructor =
        IObject.has(name, constructors) ? constructors[name] : false;

    private(T, "constructors", () => constructors);
    private(T, "defaultConstructor", () => defaultConstructor);

    return IObject.assignNonenumerable(T,
        constructors,
        { has: value => value instanceof T });
}

function product(name, definition)
{
    const hasPositionalFields = type.function.has(definition[0]);
    const fieldDefinitions = IObject
        .entries(hasPositionalFields ? definition : definition[0]);

    const initializer = f(name, function(f, T, args)
    {
        const values = hasPositionalFields ? args : args[0];
console.log(values, f, args);
        return  !hasPositionalFields && values instanceof T ?
                values :
                IObject.assign(
                    hasPositionalFields ?
                        IObject.setPrototypeOf([], T.prototype) :
                        instantiate(T),
                    IObject.fromEntries(fields(T)
                        .map(initialize(
                            T,
                            values || UseFallbackForEveryField))));
    });
    const T = algebraic(name, [initializer]);

    if (hasPositionalFields)
        IObject.setPrototypeOf(T.prototype, IArray.prototype);

    private(T, "fieldDefinitions", () => fieldDefinitions);
    console.log(private(T, "fieldDefinitions"));
    private(T, "toFallback", () =>
        false /*toFallback*/ ||
        // FIXME: Automatic if all fields can be automatic.
        (() => fail(`No fallback for ${T}`)));

    return T;
}

function fields(T)
{
    return private(T, "fields", () =>
        private(T, "fieldDefinitions")
            .map(([name, f]) => [name, new Field(f())]));
}

const initialize = (T, values) =>
    ([name, field]) =>
        [name, field.extract(T, name, values)];

const define = name => IObject.assign(
    (...fields) => product(name, fields),
    { pizza: true/*case: sum.case(name)*/ });

const data = (...arguments) =>
    isTaggedCall(arguments) ?
        define(tagResolve(...arguments)) :
        product("<anonymous>", arguments);


module.exports = data;


const type = require("./type");
