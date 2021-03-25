const { inspect } = require("util");
const given = f => f();
const fNamed = (value, f) => Object.defineProperty(f, "name", { value });
const curry = (value, binding) =>
    typeof value !== "function" ?
        value :
        given(({ ...copy } = binding) => (...args) => value(copy, ...args));
const JSSet = global.Set;

const Set = ([name]) => function ({ initialize = x => x, ...definition })
{
    const entries = Object.entries(definition);
    const Set = fNamed(`Set.${name}`, function(...args)
    {   
        const properties = initialize(...args);

        return !(this instanceof Set) ?
            new Set(...args) :
            entries.reduce((target, [key, value]) =>
                Object.defineProperty(
                    target,
                    key,
                    { value: curry(value, properties) }),
                this);
    });

    Set.prototype[inspect.custom] = function (depth, options)
    {
        if (depth < 0)
            return "{ … }";

        const nextDepth = options.depth === null ? null : options.depth - 1;
        const inner = value => inspect(value, { ...options, depth: nextDepth });

        return this.inspect(inner, options);
    }
/*
    Set.prototype.toString = function()
    {
        return typeof this.name === "function" ?
            this.name(this) :
            this.name;
    }*/

    return Set;
};

const Predicated = Set `Predicated` 
({
//    initialize: (subsetof, predicate) => ({ subsetof, predicate }),
    has: ({ subsetof, predicate }, item) =>
        subsetof.has(item) && predicate(item),

    inspect: ({ subsetof, predicate }, inner) =>
        `{ x ∈ ${inner(subsetof)} | ${/*predicate.name ||*/ (predicate + "")} }`
});

exports.Predicated = Predicated;

const Union = Set `Union`
({
    initialize: (...subsets) => ({ subsets }),
    has: ({ subsets }, item) => subsets.some(set => set.has(item)),

    inspect: ({ subsets }, inner) => `(${ subsets.map(inner).join(" ∪ ") })`
});

exports.Union = Union;

const Concrete = Set `Concrete`
({
    initialize: (...items) => ({ items: new JSSet(items) }),
    has: ({ items }, item) => items.has(item),

    inspect: ({ items }, inner) =>
        `{ ${[...items].map(item => inner(item)).join(", ")} }`
})

exports.null = Concrete(null);
exports.boolean = Concrete(false, true);
exports.undefined = Concrete(void(0));

const Axiomatic = Set `Axiomatic` 
({
    inspect: ({ inspect }, inner, { stylize }) => `{ ${inspect(stylize)} }`,
    has: ({ predicate }, item) => predicate(item)
});

exports.object = Axiomatic
({
    inspect: stylize => stylize("the objects", "special"),
    predicate: value => value && typeof value === "object"
});

// Should we mention IEEE 754? 
exports.number = Axiomatic
({
    inspect: stylize => stylize("the numbers", "number"),
    predicate: value => typeof value === "number"
});

exports.string = Axiomatic
({
    inspect: stylize => stylize("the strings", "string"),
    predicate: value => typeof value === "string"
});

exports.function = Axiomatic
({
    inspect: stylize => stylize("the functions", "special"),
    predicate: value => typeof value === "function"
});

Object.assign(
    exports,
    require("./integer"),
    require("./instance-of"));
