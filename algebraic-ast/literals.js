const { data, nullable, array } = require("@algebraic/type");
const { boolean, number, string, tundefined } = require("@algebraic/type/primitive");
console.log("d");
const Extra = require("./extra");
const Node = require("./node");


exports.BigIntLiteral = Node `BigIntLiteral` (
    value               =>  string,
    extra               =>  [nullable(Extra(string)), null] );

exports.BooleanLiteral = Node `BooleanLiteral` (
    value               =>  boolean );

exports.NumericLiteral = Node `NumericLiteral` (
    value               =>  number,
    extra               =>  [nullable(Extra(number)), null] );

exports.NullLiteral = Node `NullLiteral` ();

exports.RegExpLiteral = Node `RegExpLiteral` (
    flags               =>  string,
    pattern             =>  string,
    extra               =>  [nullable(Extra(tundefined)), null] );

exports.StringLiteral = Node `StringLiteral` (
    value               =>  string,
    extra               =>  [nullable(Extra(string)), null] );

exports.TemplateElement = Node `TemplateElement` (
    value               =>  Node.TemplateElement.Value,
    tail                =>  [boolean, false] );

exports.TemplateElement.Value = Node `TemplateElement.Value` (
    raw                 =>  string,
    cooked              =>  string );

exports.TemplateLiteral = Node `TemplateLiteral` (
    expressions         =>  array(Node.Expression),
    quasis              =>  array(Node.TemplateElement) );
