const { Set } = global;
const { inspect } = require("util");
const { iterator } = Symbol;
const sets = new WeakMap();

function ISet(items)
{
    if (!(this instanceof ISet))
        return new ISet(items);

    const set = new Set(items);

    sets.set(this, set);
    this.length = set.size;
}

module.exports = ISet;

ISet.prototype.has = function (item)
{
    return sets.get(this).has(item)
}

ISet.prototype[iterator] = function ()
{
    return sets.get(this)[Symbol.iterator]();
}

ISet.prototype[inspect.custom] = (function ()
{
    const given = f => f();
    const prefix = "ISet {";
    const padding = "\n  ";

    const toInnerInspect = ({ depth, ...options }) => given((
        depth = options.depth === null ? null : options.depth - 1) =>
        // We purposefully make a new options every time in case the inner
        // inspect mutates it...
        value => inspect(value, { ...options, depth }).replace(/\n/g, padding));

    return function (depth, options)
    {
        return  depth < 0 ?
            "ISet" :
            `${prefix} ${[...sets.get(this)]
                .map(toInnerInspect(options))
                .map(value => `${padding}${value}`)}\n}`;
    }
})();
