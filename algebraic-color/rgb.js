const { data, number } = require("@algebraic/type");

module.exports = data `RGB` (
    red     => number,
    green   => number,
    blue    => number,
    alpha   => [number, 1.0] );
