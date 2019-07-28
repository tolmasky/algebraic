const { isArray } = Array;
const fromEntries = require("@climb/from-entries");


module.exports = function toBabel(node)
{
    if (node === null || node === void(0))
        return node;

    if (typeof node !== "object")
        return node;

    if (isArray(node))
        return node.map(toBabel);

    const babelNode = fromEntries(Object
        .entries(node)
        .map(([key, value]) => [key, toBabel(node[key])]))

    if (typeof node.type === "string")
        babelNode.type = node.type;

    return babelNode;
}
