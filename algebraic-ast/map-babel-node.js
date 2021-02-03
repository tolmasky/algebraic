const { isArray } = Array;

const map = (keys, f) =>
{
    const trivial = node =>
        !node ? node :
        isArray(node) ? mapArray(custom, accum, node) :
        keys(node)
            .map(key => [key, node[key]])
            .flatMap(([key, child,
                uChild = custom(child)]) =>
                child === uChild ? [] : [[key, uChild]])
            .reduce((uNode, [key, child]) =>
                Object.assign(
                    node === uNode ?
                        { ...node } : uNode,
                    { [key]: child }), node);

    const custom = node =>
        !node ? node :
        isArray(node) ? mapArray(custom, node) :
        f(node, trivial);

    return node => custom(node);
}

module.exports = map;

function mapArray(f, array)
{
    const count = array.length;
    let returnedArray = array;
 
    for (let index = 0; index < count; ++index)
    {
        const original = returnedArray[index];
        const mapped = f(original);

        if (mapped === original)
            continue;

        if (array === returnedArray)
            returnedArray = array.slice(0);

        returnedArray[index] = mapped;
    }

    return returnedArray;
}
