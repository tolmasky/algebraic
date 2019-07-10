const { of } = require("@algebraic/type");
const { IsSymbol, fNamed } = require("@algebraic/type/declaration");
const MembershipSymbol = Symbol("Membership");

module.exports = function Group ([GroupName])
{
    return function (internalConstructor)
    {
        const isMember = Symbol(`is${GroupName}`);
        const Constructor = fNamed(GroupName, ([name]) =>
            (...fields) =>
                Constructor[name] = Object.assign(
                    internalConstructor([name]) (...fields),
                    { [isMember]: true }));
    
        Constructor[IsSymbol] =
            value => !!value && !!of(value)[isMember];
        Constructor[MembershipSymbol] = isMember;
    
        return Constructor;        
    }
}

module.exports.belongs = (Constructor, type) =>
    type === Constructor ||
    type[Constructor[MembershipSymbol]];
