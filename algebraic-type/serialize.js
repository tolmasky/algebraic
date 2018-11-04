const { getSerialize } = require("./declaration");
const { getPrototypeOf } = Object;


function serialize(type, value)
{
    const state = { references:new Map(), nextUID:0, tail: { } };
    const serialized = [];
    const serialize = (type, value) =>
        ((serialize, unique) => unique ?
            serialize(value) :
            getReference(state, type, value).UID)
        (...getSerialize(type));

    var head = getReference(state, type, value);

    while (head)
    {
        const { UID, type, value } = head;

        serialized[UID] = getSerialize(type)[0](value, serialize);

        head = head.next;
    }
    
    return serialized;
}

module.exports = serialize;
module.exports.serialize = serialize;

function getReference(state, type, value)
{
    var forType = state.references.get(type);

    if (!forType)
        state.references.set(type, forType = new Map());

    const reference = forType.get(value);

    if (reference !== void 0)
        return reference;

    const UID = state.nextUID++;
    const newReference = { UID, type, value };

    forType.set(value, newReference);

    state.tail.next = newReference;
    state.tail = newReference;

    return newReference;
}
