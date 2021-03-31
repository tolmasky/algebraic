const OrderedSet = require("../iset");
const { inspect } = require("util");
const { iterator } = Symbol;
const f = require("./f-construct");

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


const data = ([name]) => function (definition)
{
    const { [initialize]: fInitialize, ...rest } = definition;
    const entries = Object.entries(rest);
    const internal = new WeakMap();
    const PT = f.constructible `${name}` (function (T, ...args)
    {
        if (args[0] === instantiate)
            return this;

        const result = fInitialize(...args);
        const isJustObject =
            result && ObjectGetPrototypeOf(result) !== ObjectPrototype;

        return isJustObject?
            result :
            ObjectAssign(
                this instanceof T ?
                    this :
                    new T(instantiate),
                result);
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
    [initialize]: (...values) => ({ items: new OrderedSet(values) }),

    has: ({ items }, item) => items.has(item),
    inspect: ({ items }, inner) =>
        `{ ${[...items].map(item => inner(item)).join(", ")} }`
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
