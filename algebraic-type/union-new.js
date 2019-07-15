const fNameRegExp = /(is|or)\s*=>/;
const tagged = require("./tagged");
const { is, declare } = require("./declaration");
const cached = f => (cached => () => cached ?
    cached.value : (cached = { value: f() }).value)
    (false);
const UnionComponents = Symbol("union.components");

module.exports = tagged((name, ...fields) =>
{
    const types = cached(() => fields.map(field => field()));
    const isUnion = value => types().some(type => is(type, value));

    return Object.assign(
        declare({ is: isUnion, typename: name, kind: module.exports }),
        { [UnionComponents]: types });
});

module.exports.components = type => type[UnionComponents]();
