const { inspect } = require("util");

function RestrictedComprehension(subsetof, predicate)
{
    this.subsetof = subsetof;
    this.predicate = predicate;
}

RestrictedComprehension.prototype[inspect.custom] = function()
{   
    return `{ x ∈ ${this.subsetof} | ${this.predicate} }`;
}

/*
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
}*/

