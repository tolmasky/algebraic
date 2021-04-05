const { IArray, IObject } = require("./intrinsics");

const Instantiate = { };
const UseFallbackForEveryField = { };
const private = require("./private");
const f = require("./function-define");
const given = f => f();
const fail = require("./fail");

const type = require("./type");
const Field = require("./field");
const isJSFuntion = value => typeof value === "function";

// Product types can either have *positional* fields, in which case we interpret
// it to be a tuple, or labeled properties, in which case we interpret it to be
// an object. The main difference is that in pattern matching, we spread the
// values in the case of calls to `match`.
//
// FIXME: If you pass an array, should we interpret that to be positional too?

function product(name, definition, toFallback)
{
    const hasPositionalFields = isJSFuntion(definition[0]);
    const fieldDefinitions = IObject
        .entries(hasPositionalFields ? definition: definition[0]);

    const T = f.constructible(name, function (T, ...args)
    {
        const values = hasPositionalFields ? args : args[0];

        return  values instanceof T ? values :
                values === Instantiate ? this :
                IObject.freeze(IObject.assign(
                    hasPositionalFields ?
                        IObject.setPrototypeOf([], T.prototype) :
                    this instanceof T ?
                        this :
                        new T(Instantiate),
                    IObject.fromEntries(fields(T)
                        .map(initialize(
                            T,
                            values || UseFallbackForEveryField)))));
    },
    type.prototype);

    T.has = value => value instanceof T;

    if (hasPositionalFields)
        IObject.setPrototypeOf(T.prototype, IArray.prototype);

    private(T, "fieldDefinitions", () => fieldDefinitions);
    private(T, "toFallback", () =>
        toFallback ||
        // FIXME: Automatic if all fields can be automatic.
        (() => fail(`No fallback for ${T}`)));

    return T;
}

module.exports = product;

function fallback(T)
{
    return private(T, "fallback", () => private(T, "toFallback")());
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
