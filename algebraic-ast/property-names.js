const type = require("@algebraic/type");
const Node = require("./node");


exports.PropertyName = type.union `PropertyName` (
    is                  =>  Node.LiteralPropertyName,
    or                  =>  Node.ComputedPropertyName );

exports.IdentifierName = Node `IdentifierName`
({
    name                :of =>  type.string
});

exports.LiteralPropertyName = type.union `LiteralPropertyName` (
    of                  =>  Node.IdentifierName,
    of                  =>  Node.StringLiteral,
    of                  =>  Node.NumericLiteral );

exports.ComputedPropertyName = Node `ComputedPropertyName`
({
    expression          :of =>  Node.Expression
});
