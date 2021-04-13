const { inspect } = require("util");
const given = f => f();
const fNamed = (value, f) => Object.defineProperty(f, "name", { value });
const curry = (value, binding) =>
    typeof value !== "function" ?
        value :
        given(({ ...copy } = binding) => (...args) => value(copy, ...args));
const OrderedSet = global.Set;
const JSSet = global.Set;
const fInspect = require("./function-inspect");
const style = require("./style");
const annotatable = require("./annotatable");
const partition = require("@climb/partition");
const Instantiate = Symbol("Set.Instantiate");
const f = require("./f-construct");

const Set = ([name]) => function ({ initialize = x => [false, x], ...definition })
{
    const entries = Object.entries(definition);

    const Set = f.constructible `Set.${name}` (function (Set, ...args)
    {console.log(initialize);
        return  args[0] === Instantiate ? this :
                given(([replace, initialized] = initialize(args)) =>
                replace ?
                    initialized :
                    entries.reduce((target, [key, value]) =>
                        Object.defineProperty(
                            target,
                            key,
                            { value: f `${key}`
                                (function (f, ...args)
                                    { return value(this, ...args) }) }),
                        Object.assign(
                            this instanceof Set ?
                                this : new Set(Instantiate),
                            initialized)));
    });

    Set.prototype[inspect.custom] = function (depth, options)
    {
        if (depth < -1)
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

    inspect: ({ name, subsetof, predicate }, inner, { stylize }) =>
        name ||
        `{ ${style.x} ∈ ${inner(subsetof)} : ${fInspect(stylize, predicate)} }`
});

exports.Predicated = Predicated;

const Union = Set `Union`
({
    initialize: (...sets) => given((
        condensed = condense(sets)) =>
        condensed.length <= 0 ? Empty :
        condensed.length === 1 ? condensed[0] :
        { subsets: condensed }),

    has: ({ subsets }, item) => subsets.some(set => set.has(item)),

    inspect: ({ subsets }, inner) => `(${ subsets.map(inner).join(" ∪ ") })`
});


function condense(sets)
{
    const every = new OrderedSet();
    const note = items => (items, items.map(item => every.add(item)));
    const list = sets.reduceRight((next, set) =>
        !(set instanceof Concrete) ? { set, next } :
        !next || !next.items ? { items: [...set.items], next } :
        { ...next, items: set.items.concat(next.items) },
        false);
    const iterate = function * (list)
        { list && (yield list, (yield * iterate(list.next))); };
console.log(Array
        .from(iterate(list)));
    return Array
        .from(iterate(list))
        .map(({ set, items }) =>
            set ||
            Concrete(...note(items.filter(item => every.has(item)))));
}

exports.Union = Union;

const Concrete = Set `Concrete`
({
    initialize: (...items) => ({ items: new JSSet(items) }),
    has: ({ items }, item) => items.has(item),

    inspect: ({ items }, inner) =>
        `{ ${[...items].map(item => inner(item)).join(", ")} }`
});

const Empty = Concrete();

exports.Empty = Empty;

exports.null = Concrete(null);
exports.boolean = Concrete(false, true);
exports.undefined = Concrete(void(0));

const Axiomatic = Set `Axiomatic` 
({
    inspect: ({ inspect }, inner) => style("italic", inspect()),
    has: ({ predicate }, item) => predicate(item)
});

exports.object = Axiomatic
({
    inspect: () => style("special", "the objects"),
    predicate: value => value && typeof value === "object"
});

// Should we mention IEEE 754? 
exports.number = Axiomatic
({
    inspect: () => style("number", "the numbers"),
    predicate: value => typeof value === "number"
});

exports.string = Axiomatic
({
    inspect: () => style("string", "the strings"),
    predicate: value => typeof value === "string"
});

exports.function = Axiomatic
({
    inspect: () => style("special", "the functions"),
    predicate: value => typeof value === "function"
});

exports.symbol = Axiomatic
({
    inspect: () => style("symbol", "the symbols"),
    predicate: value => typeof value === "symbol"
});

exports.bigint = Axiomatic
({
    inspect: () => style("bigint", "the bigints"),
    predicate: value => typeof value === "bigint"
});




const { isArray } = Array;

exports.array = Predicated
({
    subsetof: exports.object,
    predicate: isArray
});

Object.assign(
    exports,
    require("./integer"),
    require("./instance-of"));
