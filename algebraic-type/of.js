const { primitives } = require("./primitive");


module.exports = function of(object)
{
    const ptype = typeof object;

    return  object === null ? primitives.tnull :
            ptype === "undefined" ? primitives.tundefined :
            ptype === "number" ? primitives.number :
            ptype === "string" ? primitives.string :
            ptype === "boolean" ? primitives.boolean :
            Object.getPrototypeOf(object).constructor;
}