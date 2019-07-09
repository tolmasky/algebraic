const { data, string } = require("@algebraic/type");
const { Set } = require("@algebraic/collections");
const StringSet = Set(string);

const Scope = data `Scope` (
    free        => [StringSet, StringSet()],
    varBound    => [StringSet, StringSet()],
    letBound    => [StringSet, StringSet()] );

Scope.identity = Scope({ });
Scope.concat = function (lhs, rhs)
{
    if (lhs === Scope.Identity)
        return rhs;

    if (rhs === Scope.Identity)
        return lhs;

    const varBound = lhs.varBound.union(rhs.varBound);
    const letBound = lhs.letBound.union(rhs.letBound);
    const free = lhs.free
        .union(rhs.free)
        .subtract(varBound)
        .subtract(letBound);

    return Scope({ free, varBound, letBound });
}

Scope.fromLetBindings = letBound => Scope({ letBound });
Scope.fromVarBindings = letBound => Scope({ letBound });



Scope.reduce = nodes => nodes
    .map(node => node.scope)
    .reduce(Scope.concat, Scope.identity);



Scope.justFree = scope => Scope({ free: scope.free });
Scope.fromFree = variable => Scope({ free: StringSet([variable]) });
Scope.fromBound = variable => Scope({ bound: StringSet([variable]) });

const symbol = Symbol("Scope");

Scope.for = node => node && node[symbol] || Scope.identity;
Scope.with = (node, scope) => (node[symbol] = Scope(scope), node);
Scope.has = node => !!node[symbol];

module.exports = Scope;

