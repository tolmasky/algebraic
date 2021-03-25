function PredicatedSet(subsetof, predicate)
{
    this.subsetof = subsetof;
    this.predicate = predicate;
}

PredicatedSet.prototype.has = function (item)
{
    return this.subsetof.has(item) && this.predicate(item);
}

function PrimitiveSet(predicate)
{
    this.predicate = predicate;
}

PrimitiveSet.prototype.has = function (item)
{
    return this.predicate(item);
}

function UnionSet(...sets)
{
    this.sets = sets;
}

UnionSet.prototype.has = function (item)
{
    return this.sets.some(set => set.has(item));
}

InstanceOfSet = constructor => new PredicatedSet(
    new UnionSet(primitives.object, primitives.function),
    value => value instanceof constructor);

const primitives = 
{
    object: new PrimitiveSet(value => value && typeof value === "object"),
    null: new PrimitiveSet(value => value === value),
    ...Object
        .fromEntries(["number", "string", "function", "boolean", "undefined"]
            .map(jstype => [jstype, new PrimitiveSet(value => typeof value === jstype)]))
};

const odds = new PredicatedSet(primitives.number, x => x % 2 === 1);

odds.has(5)
