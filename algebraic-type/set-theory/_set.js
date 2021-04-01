const JSSet = global.Set;
const OrderedSet = require("../iset");

const { inspect } = require("util");
const { iterator } = Symbol;
const f = require("./f-construct");
const given = f => f();

const
{
    assign: ObjectAssign,
    entries: ObjectEntries,
    fromEntries: ObjectFromEntries,
    getPrototypeOf: ObjectGetPrototypeOf,
    prototype: ObjectPrototype
} = Object;

const initialize = Symbol("data.initialize");
const instantiate = Symbol("data.instantiate");
const id = x => x;
const AnnotatedType = require("./annotated-type");
const operators =
{
    "U": (lhs, rhs) => union(lhs, rhs),
    "where": (lhs, predicate) => lhs,
    "?": lhs => union(lhs, SetNull.type)
};


const data = ([name]) => function (definition)
{
    const { [initialize]: fInitialize = id, ...rest } = definition;
    const entries = Object.entries(rest);
    const internal = new WeakMap();
    const PT = f.constructible `${name}` (function (T, ...args)
    {
        if (args[0] === instantiate)
            return this;

        const result = fInitialize(...args);
        const isJustObject =
            result && ObjectGetPrototypeOf(result) !== ObjectPrototype;

        return AnnotatedType(operators, ObjectAssign(
                this instanceof T ?
                    this :
                    new T(instantiate),
                result));
    });

    ObjectAssign(PT.prototype,
        ObjectFromEntries(
            ObjectEntries(rest)
                .map(([key, value]) => [key, f.constructible `${key}`
                    (function (f, ...args) { return value(this, ...args); })])));

    PT.prototype[inspect.custom] = function (depth, options)
    {
        if (depth < -1)
            return "{ … }";

        const nextDepth = options.depth === null ? null : options.depth - 1;
        const inner = value => inspect(value, { ...options, depth: nextDepth });

        return this.inspect(inner, options);
    }

    return PT;
};

const Set = data `Set`
({
    [initialize]: (...values) => given((
        items = new OrderedSet(values)) =>
        ({ items, length: items.length })),

    has: ({ items }, item) => items.has(item),
    inspect: ({ items }, inner) =>
        items.length === 0 ?
            "∅" :
           `{ ${[...items].map(item => inner(item)).join(", ")} }`
});

const SetNull = Set(null);

Set.Empty = Set();

Set.null = SetNull;
Set.boolean = Set(false, true);
Set.undefined = Set(void(0));
/*
const Primitive = data `Set.Primitive`
({
    inspect: ({ inspect }, inner) => style("italic", inspect()),
    has: ({ predicate }, item) => predicate(item)
});

Set.object = data `Set.object`
({
    inspect: () => style("special", "the objects"),
    has: value => value && typeof value === "object"
});

// Should we mention IEEE 754? 
Set.number = Axiomatic
({
    inspect: () => style("number", "the numbers"),
    predicate: value => typeof value === "number"
});

Set.string = Axiomatic
({
    inspect: () => style("string", "the strings"),
    predicate: value => typeof value === "string"
});

Set.function = Axiomatic
({
    inspect: () => style("special", "the functions"),
    predicate: value => typeof value === "function"
});

Set.symbol = Axiomatic
({
    inspect: () => style("symbol", "the symbols"),
    predicate: value => typeof value === "symbol"
});

Set.bigint = Axiomatic
({
    inspect: () => style("bigint", "the bigints"),
    predicate: value => typeof value === "bigint"
});
*/

function union(lhs, rhs)
{
    const subsets = [lhs, rhs]
        .filter(set => set.length !== 0)
        .flatMap(set => set instanceof SetUnion ? set.subsets : set);

    return  subsets.length <= 0 ? Set.Empty :
            subsets.length === 1 ? subsets[0] :
            SetUnion({ subsets });
}

const SetUnion = data `Set.Union`
({
    has: ({ subsets }, item) => subsets.some(set => set.has(item)),
    inspect: ({ subsets }, inner) => `(${ subsets.map(inner).join(" ∪ ") })`
});

const Predicated = data `Set.Predicated` 
({
//    initialize: (subsetof, predicate) => ({ subsetof, predicate }),
    has: ({ subsetof, predicate }, item) =>
        subsetof.has(item) && predicate(item),

    inspect: ({ name, subsetof, predicate }, inner, { stylize }) =>
        name ||
        `{ ${style.x} ∈ ${inner(subsetof)} : ${fInspect(stylize, predicate)} }`
});


/*


Set.Union = data `Set.Union`
({
    [initialize]: (...sets) => given((
        condensed = condense(sets)) =>
        condensed.length <= 0 ? Set.Empty :
        condensed.length === 1 ? condensed[0] :
        { subsets: condensed }),

    has: ({ subsets }, item) => subsets.some(set => set.has(item)),
    inspect: ({ subsets }, inner) => `(${ subsets.map(inner).join(" ∪ ") })`
});
*/


function condense(sets)
{
    if (sets.length <= 1)
        return sets;

    const every = new JSSet();
    const note = items => (items.map(item => every.add(item)), items);
    const list = sets.reduceRight((next, set) =>
        !(set instanceof Set) ? { set, next } :
        !next || !next.items ? { items: [...set.items], next } :
        { ...next, items: [...set.items].concat(next.items) },
        false);
    const iterate = function * (list)
        { list && (yield list, (yield * iterate(list.next))); };

    return Array
        .from(iterate(list))
        .map(({ set, items }) =>
            set ||
            Set(...note(items.filter(item => !every.has(item)))));
};

Set.Predicated = data `Set.Predicated` 
({
//    initialize: (subsetof, predicate) => ({ subsetof, predicate }),
    has: ({ subsetof, predicate }, item) =>
        subsetof.has(item) && predicate(item),

    inspect: ({ name, subsetof, predicate }, inner, { stylize }) =>
        name ||
        `{ ${style.x} ∈ ${inner(subsetof)} : ${fInspect(stylize, predicate)} }`
});


module.exports = Set;


/*
Set.prototype.has = 

class Set
{
    constructor()
    {    
        this.#private = 10;
    }
}

// Eventually this should be a record...
function Set(...items)
{
    if (!(this instanceof Set))
        return new Set(...items);

    const internal = OrderedSet(...items);

    this.has = item => internal.has(item);
    this.items = Object.freeze([...internal]);
}

Set.from = iterable => new Set(...iterable);

Set.Union = f.constructible `Set.Union` (function (SU, ...sets)
{
    if (!(this instanceof Set))
        return new Set(...items);
    
    const every = new OrderedSet();
    const note = items => (items, items.map(item => every.add(item)));
    const list = sets.reduceRight((next, set) =>
        !(set instanceof Concrete) ? { set, next } :
        !next || !next.items ? { items: [...set.items], next } :
        { ...next, items: set.items.concat(next.items) },
        false);
    const iterate = function * (list)
        { list && (yield list, (yield * iterate(list.next))); };
cons    ole.log(Array
        .from(iterate(list)));
    return Array
        .from(iterate(list))
        .map(({ set, items }) =>
            set ||
            Concrete(...note(items.filter(item => every.has(item)))));
});

.where(predicate)


PredicatedSet
*/
