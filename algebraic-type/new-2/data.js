const { hasOwnProperty } = Object;
const fail = require("../fail");
const fromEntries = require("@climb/from-entries");
const type = require("./type");
const provenancing = require("./provenancing");
const CachedFields = new WeakMap();
const given = f => f();

const toResolvedFields = entries => entries
    .map(([key, value]) => [key, value()]);

const ResolvedCachedFields = new WeakMap();
const toResolvedFieldsCached = T =>
    ResolvedCachedFields.has(T) ?
        ResolvedCachedFields.get(T) :
        given((fields = toResolvedFields(T)) =>
            (ResolvedCachedFields.set(T, fields), fields));

module.exports = provenancing(function data(fields)
{
    const unresolvedFields = Object.entries(fields);

    const T = provenancing(function data(values)
    {
        // FIXME: values instanceof T return values...
        const fields = toResolvedFieldsCached(unresolvedFields);

        return fromEntries(fields
            .map(([key, FieldT]) =>
                !hasOwnProperty.call(values, key) ?
                    fail.type(``) :
                given((value = values[key]) =>
                [
                    key,
                    type.satisfies(FieldT, value) ?
                        value :
                        fail.type(``)
                ])));        
    });
console.log(T);
    return T;
});
