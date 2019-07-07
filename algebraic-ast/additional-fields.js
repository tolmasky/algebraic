const { data, string } = require("@algebraic/type");
const { Set } = require("@algebraic/collections");
const Scope = require("./scope");
const NameSet = Set(string);

const unionBinaryScope =
    [Scope, (left, right) => Scope.concat(left.scope, right.scope)];

const NameSetMonoid =
    { concat: (lhs, rhs) => lhs.concat(rhs), identity: NameSet() };
const toMonoid = M => M === Scope ? Scope : NameSetMonoid;
const concat = (M_, key, items, M = toMonoid(M_)) =>
    items.map(item => item[key]).reduce(M.concat, M.identity);

module.exports =
{
    VariableDeclaration: data `VariableDeclaration` (
        ([scope]) => [Scope, declarations =>
            concat(Scope, "scope", declarations)] ),

    VariableDeclarator: data `VariableDeclarator` (
        ([scope]) => [Scope, (id, init) => concat(Scope, "scope", [id, init])]),

    ArrayPattern: data `ArrayPattern` (
        ([names]) => [NameSet, elements => concat(NameSet, "names", elements)],
        ([scope]) => [Scope, elements => concat(Scope, "scope", elements)] ),

    AssignmentPattern: data `AssignmentPattern` (
        ([names]) => [NameSet, left => left.names],
        ([scope]) => [Scope, right => right.scope] ),

    ObjectPattern: data `ObjectPattern` (
        ([names]) => [NameSet, properties =>
            concat(NameSet, "names", properties)],
        ([scope]) => [Scope, properties =>
            concat(Scope, "scope", properties)] ),

    RestElement: data `RestElement` (
        ([names]) => [NameSet, argument => argument.names],
        ([scope]) => [Scope, argument => argument.scope] ),

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
