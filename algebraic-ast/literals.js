const { data, nullable, array } = require("@algebraic/type");
const { boolean, number, string, tundefined } = require("@algebraic/type/primitive");
const Node = require("./node");
const { StringSet } = require("./string-set");
const compute = require("./compute");
const Extra = require("./extra");


exports.BigIntLiteral = Node `BigIntLiteral` (
    value               =>  string,
    extra               =>  [nullable(Extra(string)), null],
    ([freeVariables])   =>  compute.empty (StringSet) );

exports.BooleanLiteral = Node `BooleanLiteral` (
    value               =>  boolean,
    ([freeVariables])   =>  compute.empty (StringSet) );

exports.NumericLiteral = Node `NumericLiteral` (
    value               =>  number,
    extra               =>  [nullable(Extra(number)), null],
    ([freeVariables])   =>  compute.empty (StringSet) );

exports.NullLiteral = Node `NullLiteral` (
    ([freeVariables])   =>  compute.empty (StringSet) );

exports.RegExpLiteral = Node `RegExpLiteral` (
    flags               =>  string,
    pattern             =>  string,
    extra               =>  [nullable(Extra(tundefined)), null],
    ([freeVariables])   =>  compute.empty (StringSet) );

exports.StringLiteral = Node `StringLiteral` (
    value               =>  string,
    extra               =>  [nullable(Extra(string)), null],
    ([freeVariables])   =>  compute.empty (StringSet) );

exports.TemplateElement = Node `TemplateElement` (
    value               =>  Node.TemplateElement.Value,
    tail                =>  [boolean, false] );

exports.TemplateElement.Value = data `TemplateElement.Value` (
    raw                 =>  string,
    cooked              =>  string );

exports.TemplateLiteral = Node `TemplateLiteral` (
    expressions         =>  array(Node.Expression),
    quasis              =>  array(Node.TemplateElement),
    ([freeVariables])   =>  comput (StringSet,
                                take => `expressions` ) );



