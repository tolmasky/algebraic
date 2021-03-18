const { declare, getTypename } = require("./declaration");
const { parameterized } = require("./parameterized");

module.exports = parameterized(T => declare
({
    is: Array.isArray,
    typename: `array <${getTypename(T)}>`,
    serialize: null,
    deserialize: null,
    kind: module.exports
}));
