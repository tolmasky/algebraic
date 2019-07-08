const { parameterized } = require("./parameterized");
const { data } = require("./data");
const union = require("./union");

module.exports = parameterized (T =>
    union `maybe <${T}>` (
        data `just` (value => T),
        data `nothing` () ) );
