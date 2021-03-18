const { parameterized } = require("./parameterized");
const { data } = require("./data");
const union = require("./union");

module.exports = parameterized ((S, F) =>
    union `result <${S}, ${F}>` (
        data `success` (value => S),
        data `failure` (value => F) ) );
