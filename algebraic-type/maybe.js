const { parameterized } = require("./parameterized");
const { data } = require("./data");
const { union } = require("./union");

exports.Maybe = parameterized (T =>
    union `Maybe<${T}>` (
        T,
        data `Nothing` () ) );
