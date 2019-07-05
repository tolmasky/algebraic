const { parameterized } = require("./parameterized");
const { union } = require("./union");
const { tnull } = require("./primitive");

module.exports = parameterized (T =>
    union `nullable <${(console.log(T),T)}>` (
        tnull,
        T ) );
