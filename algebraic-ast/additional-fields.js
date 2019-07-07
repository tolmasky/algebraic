const { data, string } = require("@algebraic/type");
const { Set } = require("@algebraic/collections");
const Scope = require("./scope");
const NameSet = Set(string);
const unionBinaryScope =
    [Scope, (left, right) => Scope.concat(left.scope, right.scope)];



module.exports =
{
    VariableDeclaration: data `VariableDeclaration` (
        ([scope]) => [Scope, declarations => Scope.reduce(declarations)] ),

    VariableDeclarator: data `VariableDeclarator` (
        ([scope]) => [Scope, (id, init) =>
            Scope.concat(Scope({ bound: id.names }), init.scope)] ),

    AssignmentPattern: data `AssignmentPattern` (
        ([names]) => [NameSet, left => left.names],
        ([scope]) => [Scope, right => right.scope] ),

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

    // Introduces all the left patterns to free scope?
/*
    AssignmentExpression: data `AssignmentExpression` (
        ([names]) => [NameSet, left => left.names],
        ([scope]) => unionBinaryScope ),
*/
    BinaryExpression: data `BinaryExpression` (
        ([scope]) => unionBinaryScope ),
    
    LogicalExpression: data `LogicalExpression` (
        ([scope]) => unionBinaryScope ),

    UnaryExpression: data `UnaryExpression` (
        ([scope]) => unionBinaryScope ),
};
