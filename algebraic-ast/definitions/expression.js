const { nullable, union, array } = require("@algebraic/type");
const { boolean, string, tundefined } = require("@algebraic/type/primitive");
const Node = require("./node");
const References = require("./references");
const SelfContained = require("./self-contained");
//const Pattern = 


const ArrayExpression = Node `ArrayExpression` (
    elements        => array(Expression),
    ([references])  => References.from("elements") );

const CallExpression = Node `CallExpression` (
    callee          => Expression,
    arguments       => array(Expression),
    ([references])  => References.from("callee", "arguments") );

const ConditionalExpression = Node `ConditionalExpression` (
    test            => Expression,
    consequent      => Expression,
    alternate       => Expression,
    ([references])  => References.from("test", "consequent", "alternate") );

const IdentifierExpression = Node `IdentifierExpression {ESTree = Identifier}` (
    name            => string,
    ([references])  => [References, name => References([name])] );

const BinaryExpression = Node `BinaryExpression` (
    left            => Expression,
    right           => Expression,
    operator        => string,
    ([references])  => References.from("left", "right") );

const LogicalExpression = Node `LogicalExpression` (
    left            => Expression,
    right           => Expression,
    operator        => string,
    ([references])  => References.from("left", "right") );

const StaticMemberExpression = Node `StaticMemberExpression` (
    object          => Expression,
    property        => string,
    ([references])  => References.from("object") );

const ComputedMemberExpression = Node `ComputedMemberExpression` (
    object          => Expression,
    property        => Expression,
    ([references])  => References.from("object", "property") );

const NewExpression = Node `NewExpression` (
    callee          => Expression,
    arguments       => array(Expression),
    ([references])  => References.from("callee", "arguments") );

const ThisExpression = Node `ThisExpression` (
    ([references])  => References.Never );

const SequenceExpression = Node `SequenceExpression` (
    expressions     => array(Expression),
    ([references])  => References.from("expressions") );

const UnaryExpression = Node `UnaryExpression` (
    argument        => Expression,
    operator        => string,
    prefix          => [boolean, true],
    ([references])  => References.from("argument") );

/*
const AssignmentExpression = Node `AssignmentExpression` (
    left            => Node.RootPattern,
    right           => Expression,
    ([references])  => [References, (left, right) => left.union(right)] ),

const BooleanLiteral = Node `BooleanLiteral` (
    value   => boolean );

const NumericLiteral = Node `NumericLiteral` (
    value   => number,
    extra   => [nullable(Extra(number)), null] );

const NullLiteral = Node `NullLiteral` ( );

const RegExpLiteral = Node `RegExpLiteral` (
    flags   => string,
    pattern => string,
    extra   => [nullable(Extra(tundefined)), null] );

const StringLiteral = Node `StringLiteral` (
    value   => string,
    extra   => [nullable(Extra(string)), null] );

module.exports = union `SelfContained` (
    BigIntLiteral,
    BooleanLiteral,
    NumericLiteral,
    NullLiteral,
    RegExpLiteral,
    StringLiteral );*/
    
const Expression = union `Expression` (
    ...union.components(SelfContained),
    ArrayExpression,
    CallExpression,
    ConditionalExpression,
    IdentifierExpression,
    BinaryExpression,
    LogicalExpression,
    ComputedMemberExpression,
    StaticMemberExpression,
    NewExpression,
    ThisExpression,
    SequenceExpression,
    UnaryExpression );

module.exports = Expression;
