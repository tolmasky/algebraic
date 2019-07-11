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
    result: require("./result")
};

module.exports = type;
module.exports.type = type;
