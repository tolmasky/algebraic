const fNameRegExp = /(is|or)\s*=>/;
const tagged = require("./tagged");
const { is, IsSymbol, UUIDSymbol } = require("./declaration");
const cached = f => (cached => () => cached ?
    cached.value : (cached = { value: f() }).value)
    (false);

module.exports = tagged((name, ...fields) =>
{
    const types = cached(() => fields.map(field => field()));
    const isUnion = value => types().some(type => is(type, value));

    return Object.assign(is, { [IsSymbol]: isUnion, [UUIDSymbol]: "aaaaa-"+ name });
});
