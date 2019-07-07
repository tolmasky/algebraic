const { data } = require("@algebraic/type");
const Scope = require("./scope");



module.exports =
{
    BigIntLiteral: data `BigIntLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    BooleanLiteral: data `BooleanLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    NumericLiteral: data `NumericLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    NullLiteral: data `NullLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    RegExpLiteral: data `RegExpLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    StringLiteral: data `StringLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    IdentifierExpression: data `IdentifierExpression` (
        ([scope]) => [Scope, name => Scope.fromFree(name)] ),

    BinaryExpression: data `BinaryExpression` (
        ([scope]) => [Scope, (left, right) =>
            Scope.concat(left.scope, right.scope)] ),
    
    LogicalExpression: data `LogicalExpression` (
        ([scope]) => [Scope, (left, right) =>
            Scope.concat(left.scope, right.scope)] ),

    UnaryExpression: data `UnaryExpression` (
        ([scope]) => [Scope, argument => argument.scope] ),
};
