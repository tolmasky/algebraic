const { isArray } = Array;
const { is, of, getTypename } = require("@algebraic/type");
const Node = require("./node");


module.exports = function (mappings)
{
    const map = node =>
        isArray(node) ?
            mapArray(node, map) : (console.log(getTypename(of(node))),
            (mappings[getTypename(of(node))] || mapChildren)(node, map));
    return map;
}

function mapArray(nodes, map)
{
    return nodes.reduce((updated, node, index) =>
        (mapped => node === mapped ?
            updated :
            (nodes === updated && (updated = [...nodes]),
                updated[index] = mapped,
                updated))(map(node)), nodes);
}

function mapChildren(node, map)
{
    const mappedChildren = Object
        .entries(node)
        .filter(([_, node]) => is (Node, node) || isArray(node))
        .map(([key, node]) => [key, map(node), node])
        .filter(([_, mapped, node]) => node !== mapped)

    return mappedChildren.length <= 0 ?
        node :
        of(node)({ ...node, ...Object.fromEntries(mappedChildren) });
}
