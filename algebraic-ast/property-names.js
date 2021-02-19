const { string, or } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const Node = require("./node");


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
