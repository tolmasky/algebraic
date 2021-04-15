const { IObject } = require("./intrinsics");
const { isTaggedCall, tagResolve } = require("./templating");
const given = f => f();


const toFConstruct = constructible => function fInfer(...args)
{
    return isTaggedCall(args) ?
        (...rest) => fInfer(tagResolve(...args), ...rest) :
        given((offset = typeof args[0] === "string" ? 1 : 0) =>
        fConstruct
        ({
            name: offset === 0 ? false : args[0],
            implementation: args[offset],
            fProperties: args[offset + 1] || (() => []),
            constructible
        }));
}

function fConstruct({ name, implementation, fProperties, constructible = false })
{
    const f = constructible ?
        function (...args) { return implementation.call(this, f, ...args); } :
        (...args) => implementation(f, ...args);

    return [name && property({ name: "name", value: name })]
        .concat(fProperties(f, property))
        .filter(x => !!x)
        .reduce((f, { type, ...rest }) =>
            type === "inherits" ?
                (IObject.setPrototypeOf(f.prototype, rest.from), f) :
            type === "prototypeOf" ?
                IObject.setPrototypeOf(f, rest.prototypeOf) :
            type === "onPrototype" ?
                (IObject.assign(f.prototype, rest.onPrototype), f) :
            /* type === "property" */
            IObject.defineProperty(f, rest.name, rest), f);
}

const property = IObject.assign(
    (...args) => args.length === 1 ?
        { type: "property", ...args[0] } :
        { type: args[0], ...args[1] },
{
    inherits: from => property("inherits", { from }),
    prototypeOf: prototypeOf => property("prototypeOf", { prototypeOf }),
    onPrototype: onPrototype => property("onPrototype", { onPrototype }),
});

const f = toFConstruct(false);

module.exports = IObject.assign(f, { f, constructible: toFConstruct(true) });
