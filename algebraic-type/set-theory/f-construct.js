const { hasOwnProperty } = Object;
const { isArray } = Array;
const { reduce } = Array.prototype;
const given = f => f();


const isTaggedCall = arguments =>
    isArray(arguments) &&
    isArray(arguments[0]) &&
    hasOwnProperty.call(arguments[0], "raw");

const resolve = (strings, ...arguments) => reduce.call(
    arguments,
    (string, argument, index) =>
        string + argument + strings[index + 1],
    strings[0]);

const toFConstruct = constructible => function fInfer(...args)
{
    return isTaggedCall(args) ?
        (...rest) => fInfer(resolve(...args), ...rest) :
        given((offset = typeof args[0] === "string" ? 1 : 0) =>
        fConstruct
        ({
            name: offset === 0 ? false : args[0],
            fImplementation: args[offset],
            prototype: args[offset + 1] || false,
            constructible
        }));
}

function fConstruct({ name, fImplementation, prototype, constructible = false })
{
    const f = constructible ?
        function (...args) { return implementation.apply(this, args); } :
        (...args) => (console.log("CALLED WITH", implementation+"", ...args, new Error().stack), (x => (console.log("RESULT: ",x),x))(implementation(...args)));
    const implementation = fImplementation(f);

    if (name !== false)
        Object.defineProperty(f, "name", { value: name });

    if (prototype !== false)
        Object.setPrototypeOf(f, prototype);

    return f;
}

module.exports = Object.assign(
    toFConstruct(false),
    { constructible: toFConstruct(true) });
