const { primitives } = require("./primitive");
const { union } = require("./union");


module.exports = union `any` (
    Object,
    ...Object.values(primitives)
        .filter(x => x !== primitives.primitive && x !== primitives) );
