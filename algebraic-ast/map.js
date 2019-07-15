const { isArray } = Array;
const { is, of, getTypename } = require("@algebraic/type");
const Node = require("./node");


module.exports = function (mappings)
{
    const map = node =>
        isArray(node) ?
            mapArray(node, map) :
            mapNode(mappings, node, map);

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

function mapNode(mappings, node, map)
{
    const type = of(node);
    const typename = getTypename(type);
    const custom = mappings[typename];

    if (custom)
        return custom(node, map);

    const mappedChildren = type
        .traversable
        .map(key => [key, map(node[key]), node[key]])
        .filter(([_, mapped, node]) => node !== mapped);

    return mappedChildren.length <= 0 ?
        node :
        type({ ...node, ...Object.fromEntries(mappedChildren) });
}
