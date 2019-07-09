const { data, parameterized, nullable, union } = require("@algebraic/type");
const { boolean, number, string, tundefined } = require("@algebraic/type/primitive");

const Node = require("./node");
const References = require("./references");

const Extra = parameterized (T =>
    data `Extra<${T}>` (
        raw         => string,
        rawValue    => T ) );

const BigIntLiteral     = Node `BigIntLiteral` (
    value               => string,
    extra               => [nullable(Extra(string)), null],
    ([references])      => References.Never );

const BooleanLiteral    = Node `BooleanLiteral` (
    value               => boolean,
    ([references])      => References.Never );

const NumericLiteral    = Node `NumericLiteral` (
    value               => number,
    extra               => [nullable(Extra(number)), null],
    ([references])      => References.Never );

const NullLiteral       = Node `NullLiteral` (
    ([references])      => References.Never );

const RegExpLiteral     = Node `RegExpLiteral` (
    flags               => string,
    pattern             => string,
    extra               => [nullable(Extra(tundefined)), null],
    ([references])      => References.Never );

const StringLiteral     = Node `StringLiteral` (
    value               => string,
    extra               => [nullable(Extra(string)), null],
    ([references])      => References.Never );

module.exports = union `SelfContained` (
    BigIntLiteral,
    BooleanLiteral,
    NumericLiteral,
    NullLiteral,
    RegExpLiteral,
    StringLiteral );
