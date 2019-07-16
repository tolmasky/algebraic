const { data, nullable, array } = require("@algebraic/type");
const { boolean, number, string, tundefined } = require("@algebraic/type/primitive");

const { KeyPathsByName } = require("./key-path");
const compute = require("./compute");

const Extra = require("./extra");
const Node = require("./node");


exports.BigIntLiteral = Node `BigIntLiteral` (
    value               =>  string,
    extra               =>  [nullable(Extra(string)), null],
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.BooleanLiteral = Node `BooleanLiteral` (
    value               =>  boolean,
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.NumericLiteral = Node `NumericLiteral` (
    value               =>  number,
    extra               =>  [nullable(Extra(number)), null],
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.NullLiteral = Node `NullLiteral` (
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.RegExpLiteral = Node `RegExpLiteral` (
    flags               =>  string,
    pattern             =>  string,
    extra               =>  [nullable(Extra(tundefined)), null],
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.StringLiteral = Node `StringLiteral` (
    value               =>  string,
    extra               =>  [nullable(Extra(string)), null],
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.TemplateElement = Node `TemplateElement` (
    value               =>  Node.TemplateElement.Value,
    tail                =>  [boolean, false],
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.TemplateElement.Value = data `TemplateElement.Value` (
    raw                 =>  string,
    cooked              =>  string );

exports.TemplateLiteral = Node `TemplateLiteral` (
    expressions         =>  array(Node.Expression),
    quasis              =>  array(Node.TemplateElement),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `expressions.freeVariables`) );



