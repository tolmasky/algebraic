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
    Δ: (original, changes) => type.of(original)({ ...original, ...changes }),
    fail: require("./fail"),
    name: require("./declaration").getUnscopedTypename,
    specifier: require("./declaration").getTypename,
    kind: require("./declaration").getKind
};

module.exports = type;
module.exports.type = type;
