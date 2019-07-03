const { primitives } = require("./primitive");
const { union } = require("./union");
const any = union `any` (
    Object,
    ...Object.values(primitives)
        .filter(x => x !== primitives.primitive && x !== primitives) );


const type =
{
    any,
    of,
    ...require("./declaration"),
    ...require("./data"),
    ...require("./union"),
    ...require("./primitive"),
    ...require("./serialize"),
    ...require("./deserialize"),
    ...require("./parameterized"),
    ...require("./maybe")
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