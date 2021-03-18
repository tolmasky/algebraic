const { getSerialize, getDeserialize } = require("./declaration");
const { hasOwnProperty } = Object.prototype;


function deserialize(type, serialized, index = 0, deserialized = [])
{
    return getDeserialize(type)(serialized[index], (type, child) =>
        getSerialize(type)[1] ?
            getDeserialize(type)(child) :
            hasOwnProperty.call(deserialized, child) ?
                deserialized[child] :
                deserialized[child] =
                    deserialize(type, serialized, child, deserialized));
}

module.exports = deserialize;
module.exports.deserialize = deserialize;
