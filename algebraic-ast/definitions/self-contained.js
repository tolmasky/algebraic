const { data, parameterized, nullable, union } = require("@algebraic/type");
const { boolean, number, string, tundefined } = require("@algebraic/type/primitive");

const Expression = require("./expression");

const Extra = parameterized (T =>
    data `Extra<${T}>` (
        raw         => string,
        rawValue    => T ) );

Expression `BigIntLiteral` (
    value               => string,
    extra               => [nullable(Extra(string)), null] );

Expression `BooleanLiteral` (
    value               => boolean );

Expression `NumericLiteral` (
    value               => number );

Expression `NullLiteral` ();

Expression `RegExpLiteral` (
    flags               => string,
    pattern             => string,
    extra               => [nullable(Extra(tundefined)), null] );

Expression `StringLiteral` (
    value               => string,
    extra               => [nullable(Extra(string)), null] );
