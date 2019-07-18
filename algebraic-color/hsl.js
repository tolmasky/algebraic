const { data, number } = require("@algebraic/type");

module.exports = data `HSL` (
    hue         => number,
    saturation  => number,
    lightness   => number,
    alpha       => [number, 1.0] );
