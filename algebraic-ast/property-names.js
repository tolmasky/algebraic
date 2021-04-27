const { type, caseof } = require("@algebraic/type");
const Node = require("./node");


exports.PropertyName = type `PropertyName`
([
    caseof `.LiteralPropertyName` (of => Node.LiteralPropertyName),
    caseof `.ComputedPropertyName` (of => Node.ComputedPropertyName)
]);

exports.IdentifierName = Node `IdentifierName`
({
    name                :of =>  type.string
});

exports.LiteralPropertyName = type `LiteralPropertyName`
([
    caseof `.IdentifierName` (of => Node.IdentifierName),
    caseof `.StringLiteral` (of => Node.StringLiteral),
    caseof `.NumericLiteral` (of => Node.NumericLiteral)
]);

exports.ComputedPropertyName = Node `ComputedPropertyName`
({
    expression          :of =>  Node.Expression
});
