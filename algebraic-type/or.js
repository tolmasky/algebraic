const { getTypename } = require("./declaration");
const { parameterized } = require("./parameterized");
const { union } = require("./union");


module.exports = parameterized((...Ts) =>
    Ts.length === 1 ?
        Ts[0] :
        union `or <${Ts.map(getTypename).join(", ")}>` (...Ts));    
