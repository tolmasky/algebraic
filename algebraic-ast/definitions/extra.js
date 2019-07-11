const { data, string, parameterized } = require("@algebraic/type");


module.exports = parameterized (T =>
    data `Extra<${T}>` (
        raw         => string,
        rawValue    => T ) );
