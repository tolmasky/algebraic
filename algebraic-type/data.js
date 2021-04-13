const { IObject, IArray } = require("./intrinsics");
const { isTaggedCall, tagResolve } = require("./templating");
const product = require("./product");
const sum = require("./sum");



function data(...args)
{
    if (isTaggedCall(args))
        return body(tagResolve(...args));

    const anonymous = typeof args[0] !== "string";
    const name = anonymous ? "anonymous" : args[0];

    if (!anonymous && args.length === 1)
        return body(name);

    const definition = anonymous ? args : args.slice(1);

    return  definition.length > 1 ?
                product(name, ...definition) :
            IArray.isArray(definition[0]) ?
                sum(name, ...definition) :
                product(name, ...definition);
}

module.exports = data;
module.exports.caseof = sum.caseof;

function body(name)
{
    return IObject.assignNonenumerable(
        (...definition) => data(name, ...definition),
        { forall: (...rest) => require("./forall")(name, ...rest) });
}

// const forall = require("./forall");

// data.constructors = T => private(T, "constructors");

// const type = require("./type");

/*
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

*/

/*
function tupleConstruct(T, C, instantiate, processed)
{
    return IObject.assign(IObject.setPrototypeOf([], T), processed);
}

function objectConstruct(T, C, instantiate, processed)
{
    return IObject.assign(instantiate(T), processed);
}

function fields(T)
{
    return private(T, "fields", () =>
        private(T, "fieldDefinitions")
            .map(([name, f]) => [name, new Field(f())]));
}

const initialize = (T, values) =>
    ([name, field]) =>
        [name, field.extract(T, name, values)];*/
