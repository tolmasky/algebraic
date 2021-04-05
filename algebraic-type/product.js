const { IArray, IObject } = require("./intrinsics");

const Instantiate = { };
const UseFallbackForEveryField = { };
const private = require("./private");
const f = require("./function-define");
const given = f => f();
const fail = require("./fail");

const type = require("./type");
const Field = require("./field");


function product(name, definition, toFallback)
{
    const isTupleDefinition = IArray.isArray(definition);
    const T = f.constructible(name, function (T, ...args)
    {
        const values = isTupleDefinition ? args : args[0];

        return  values instanceof T ? values :
                values === Instantiate ? this :
                IObject.freeze(IObject.assign(
                    isTupleDefinition ?
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

    if (isTupleDefinition)
        IObject.setPrototypeOf(T.prototype, IArray.prototype);

    private(T, "fieldDefinitions", () => IObject.entries(definition));
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
