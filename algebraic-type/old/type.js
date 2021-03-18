const { isArray } = Array;

const type =
{
    always: value => [type.of(value), () => value],
    any: require("./any"),
    array: require("./array"),
    of: require("./of"),
    ...require("./declaration"),
    ...require("./data"),
    union: require("./union"),
    ...require("./primitive"),
    ...require("./serialize"),
    ...require("./deserialize"),
    ...require("./parameterized"),
    maybe: require("./maybe"),
    nullable: require("./nullable"),
    or: require("./or"),
    result: require("./result"),
    Δ: Object.assign(
        (original, changes) =>
            !isArray(original) ?
                type.of(original)({ ...original, ...changes }) :
                (value, original) => type.Δ(key, value, original),
        { set: (key, value, original) =>
            original[key] === value ? original :
                type.of(original)({ [key]: value }) }),
    fail: require("./fail"),
    name: require("./declaration").getUnscopedTypename,
    specifier: require("./declaration").getTypename,
    kind: require("./declaration").getKind
};

module.exports = type;
module.exports.type = type;
