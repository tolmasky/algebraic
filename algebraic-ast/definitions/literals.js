const { data, nullable, parameterized, array } = require("@algebraic/type");
const { boolean, number, string, tundefined } = require("@algebraic/type/primitive");
const Node = require("./node");
const FreeVariables = require("./string-set").in `freeVariables`;

const Extra = parameterized (T =>
    data `Extra<${T}>` (
        raw         => string,
        rawValue    => T ) );

exports.BigIntLiteral = data `BigIntLiteral` (
    ([type])            => data.always ("BigIntLiteral"),
    value               => string,
    extra               => [nullable(Extra(string)), null],
    ([freeVariables])   => FreeVariables.Never );

exports.BooleanLiteral = data `BooleanLiteral` (
    ([type])            =>  data.always ("BooleanLiteral"),
    value               =>  boolean,
    ([freeVariables])   =>  FreeVariables.Never );

exports.NumericLiteral = data `NumericLiteral` (
    ([type])            =>  data.always ("NumericLiteral"),
    value               =>  number,
    ([freeVariables])   =>  FreeVariables.Never );

exports.NullLiteral = data `NullLiteral` (
    ([type])            =>  data.always ("NullLiteral"),
    ([freeVariables])   =>  FreeVariables.Never );

exports.RegExpLiteral = data `RegExpLiteral` (
    ([type])            =>  data.always ("RegExpLiteral"),
    flags               =>  string,
    pattern             =>  string,
    extra               =>  [nullable(Extra(tundefined)), null],
    ([freeVariables])   =>  FreeVariables.Never );

exports.StringLiteral = data `StringLiteral` (
    ([type])            =>  data.always ("StringLiteral"),
    value               =>  string,
    extra               =>  [nullable(Extra(string)), null],
    ([freeVariables])   =>  FreeVariables.Never );

exports.TemplateElement = data `TemplateElement` (
    ([type])            =>  data.always ("TemplateElement"),
    value               =>  Node.TemplateElement.Value,
    tail                =>  [boolean, false] );

exports.TemplateElement.Value = data `TemplateElement.Value` (
    raw                 =>  string,
    cooked              =>  string );

exports.TemplateLiteral = data `TemplateLiteral` (
    ([type])            =>  data.always ("TemplateLiteral"),
    expressions         =>  array(Node.Expression),
    quasis              =>  array(Node.TemplateElement),
    ([freeVariables])   =>  FreeVariables.from("expressions") );



