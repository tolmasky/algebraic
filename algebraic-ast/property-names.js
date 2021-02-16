const { string, or } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const Node = require("./node");
const { KeyPathsByName } = require("./key-path");


// Babel has no concept of a ComputedProperyName at all, and so this would
// require significant conversion on the way back (unlike PropertyName which
// just pretends to be an Identifier). However, we can do something similar
// here and pretend to be a ParenthesizedExpression.
/*exports.ComputedPropertyName = Node `ComputedPropertyName` (
    ([type])            =>  data.always ("ParenthesizedExpression"),

    expression          =>  Node.Expression,
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `expression.freeVariables` ) );

exports.PropertyName = Node `PropertyName` (
    ([type])            =>  data.always ("Identifier"),

    name                =>  string,
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );*/

exports.PropertyName = union `PropertyName` (
    is                  =>  Node.LiteralPropertyName,
    or                  =>  Node.ComputedPropertyName );

exports.IdentifierName = Node `IdentifierName` (
    name                =>  string );

exports.LiteralPropertyName = union `LiteralPropertyName` (
    is                  =>  Node.IdentifierName,
    or                  =>  Node.StringLiteral,
    or                  =>  Node.NumericLiteral );

exports.ComputedPropertyName = Node `ComputedPropertyName` (
    expression          =>  Node.Expression );
