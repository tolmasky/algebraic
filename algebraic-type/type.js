const { primitives } = require("./primitive");
const { union } = require("./union");


const type =
{
    any: require("./any"),
    of,
    ...require("./declaration"),
    ...require("./data"),
    union: require("./union"),
    ...require("./primitive"),
    ...require("./serialize"),
    ...require("./deserialize"),
    ...require("./parameterized"),
    ...require("./maybe"),
    nullable: require("./nullable"),
    or: require("./or")
};

module.exports = type;
module.exports.type = type;


function of(object)
{
    const ptype = typeof object;

    return  object === null ? primitives.tnull :
            ptype === "undefined" ? primitives.tundefined :
            ptype === "number" ? primitives.number :
            ptype === "string" ? primitives.string :
            ptype === "boolean" ? primitives.boolean :
            Object.getPrototypeOf(object).constructor;
}