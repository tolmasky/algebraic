const { parameterized } = require("./parameterized");
const union = require("./union-new");
const { tnull } = require("./primitive");

module.exports = parameterized (T =>
    union `nullable <${T}>` (
        is  =>  tnull,
        or  =>  T ) );
