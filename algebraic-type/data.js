const { IObject, IArray } = require("./intrinsics");
const { isTaggedCall, tagResolve } = require("./templating");
const constructible = require("./constructible");
const f = require("./function-define");

const private = require("./private");
const Field = require("./field");
const fail = require("./fail");
const UseFallbackForEveryField = { };
const case_ = require("./sum-case");


function product(name, definition)
{
    const hasPositionalFields = type.function.has(definition[0]);
    const fieldDefinitions = IObject
        .entries(hasPositionalFields ? definition : definition[0]);

    const initializer = f(name, function(f, T, instantiate, args)
    {
        const values = hasPositionalFields ? args : args[0];

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
    const T = constructible(name, [initializer]);

    if (hasPositionalFields)
        IObject.setPrototypeOf(T.prototype, IArray.prototype);

    private(T, "fieldDefinitions", () => fieldDefinitions);
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
    { case: case_(name) });

const data = (...arguments) =>
    isTaggedCall(arguments) ?
        define(tagResolve(...arguments)) :
        product("<anonymous>", arguments);


module.exports = data;


const type = require("./type");
