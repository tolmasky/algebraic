const { data } = require("@algebraic/type");
const Scope = require("./scope");



module.exports =
{
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
