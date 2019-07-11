const { data, number, string, nullable, parameterized, tundefined } = require("@algebraic/type");
const Node = require("./node");
const FreeVariables = require("./string-set").in `freeVariables`;

const Extra = parameterized (T =>
    data `Extra<${T}>` (
        raw         => string,
        rawValue    => T ) );

exports.BigIntLiteral = data `BigIntLiteral` (
    ([type])            => [string, () => "BigIntLiteral"],
    value               => string,
    extra               => [nullable(Extra(string)), null],
    ([freeVariables])   => FreeVariables.Never );

exports.BooleanLiteral = data `BooleanLiteral` (
    ([type])            => [string, () => "BooleanLiteral"],
    value               => boolean,
    ([freeVariables])   => FreeVariables.Never );

exports.NumericLiteral = data `NumericLiteral` (
    ([type])            => [string, () => "NumericLiteral"],
    value               => number,
    ([freeVariables])   => FreeVariables.Never );

exports.NullLiteral = data `NullLiteral` (
    ([type])            => [string, () => "NullLiteral"],
    ([freeVariables])   => FreeVariables.Never );

exports.RegExpLiteral = data `RegExpLiteral` (
    ([type])            => [string, () => "RegExpLiteral"],
    flags               => string,
    pattern             => string,
    extra               => [nullable(Extra(tundefined)), null],
    ([freeVariables])   => FreeVariables.Never );

exports.StringLiteral = data `StringLiteral` (
    ([type])            => [string, () => "StringLiteral"],
    value               => string,
    extra               => [nullable(Extra(string)), null],
    ([freeVariables])   => FreeVariables.Never );

exports.TemplateElement = data `TemplateElement` (
    value           =>  Node.TemplateElement.Value,
    tail            =>  [boolean, false] );

exports.TemplateElement.Value = data `TemplateElement.Value` (
    raw             =>  string,
    cooked          =>  string );

exports.TemplateLiteral = data `TemplateLiteral` (
    ([type])            =>  always ("TemplateLiteral"),
    expressions         =>  array(Node.Expression),
    quasis              =>  array(Node.TemplateElement),
    ([freeVariables])   =>  FreeVariables.from("expressions") );



