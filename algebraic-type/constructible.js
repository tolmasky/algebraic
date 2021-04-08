const { IObject, IArray } = require("./intrinsics");

const fail = require("./fail");
const type = require("./type");
const private = require("./private");

const { isTaggedCall, tagResolve } = require("./templating");
const f = require("./function-define");

const construct =
    (T, initializer, args) =>
        IObject.freeze(initializer(T, instantiate, args));
const instantiate = T => new T(instantiate);

const annotate = () => false;


module.exports = function constructible(name, initializers)
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
