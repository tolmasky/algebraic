const { data, nullable, array } = require("@algebraic/type");
const { boolean, number, string, tundefined } = require("@algebraic/type/primitive");
const Node = require("./node");
const FreeVariables = require("./string-set").in `freeVariables`;
const Extra = require("./extra");


exports.BigIntLiteral = Node `BigIntLiteral` (
    value               => string,
    extra               => [nullable(Extra(string)), null],
    ([freeVariables])   => FreeVariables.Never );

exports.BooleanLiteral = Node `BooleanLiteral` (
    value               =>  boolean,
    ([freeVariables])   =>  FreeVariables.Never );

exports.NumericLiteral = Node `NumericLiteral` (
    value               =>  number,
    ([freeVariables])   =>  FreeVariables.Never );

exports.NullLiteral = Node `NullLiteral` (
    ([freeVariables])   =>  FreeVariables.Never );

exports.RegExpLiteral = Node `RegExpLiteral` (
    flags               =>  string,
    pattern             =>  string,
    extra               =>  [nullable(Extra(tundefined)), null],
    ([freeVariables])   =>  FreeVariables.Never );

exports.StringLiteral = Node `StringLiteral` (
    value               =>  string,
    extra               =>  [nullable(Extra(string)), null],
    ([freeVariables])   =>  FreeVariables.Never );

exports.TemplateElement = Node `TemplateElement` (
    value               =>  Node.TemplateElement.Value,
    tail                =>  [boolean, false] );

exports.TemplateElement.Value = data `TemplateElement.Value` (
    raw                 =>  string,
    cooked              =>  string );

exports.TemplateLiteral = Node `TemplateLiteral` (
    expressions         =>  array(Node.Expression),
    quasis              =>  array(Node.TemplateElement),
    ([freeVariables])   =>  FreeVariables.from("expressions") );



