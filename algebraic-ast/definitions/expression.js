const { data, nullable, array, parameterized, number } = require("@algebraic/type");
const { boolean, string, tundefined } = require("@algebraic/type/primitive");
const { Set } = require("@algebraic/collections");
const StringSet = Set(string);
const References = require("./references");

const Group = require("./group");
const Node = require("./node");
const Expression = Group `Expression` (Node);


Node `IdentifierPattern` (
    ({ESTree})      => "Identifier",
    name            => string,
    ([names])       => [StringSet, name => StringSet([name])] );

Expression `AssignmentExpression` (
    left            =>  Node.IdentifierPattern,
    right           =>  Expression,
    operator        =>  string,
    ([references])  =>  [References, (left, right) =>
            left.references
                .union(right.references, left.names)] );

//({free:name})   =>  string
Expression `IdentifierExpression` (
    ({ESTree})      =>  "Identifier",
    name            =>  string,
    ([references])  =>  [References, name => References([name])] );

Expression `ArrowFunctionExpression` (
    body            => Expression,
    id              => nullable(string),
    params          => array(nullable(string)),
    ([generator])   => [boolean, () => false],
    async           => [boolean, false] );

Expression `ArrayExpression` (
    elements        =>  array(Expression) );

Expression `CallExpression` (
    callee          =>  Expression,
    arguments       =>  array(Expression) );

Expression `ConditionalExpression` (
    test            =>  Expression,
    consequent      =>  Expression,
    alternate       =>  Expression );

Expression `BinaryExpression` (
    left            =>  Expression,
    right           =>  Expression,
    operator        =>  string );

Expression `LogicalExpression` (
    left            =>  Expression,
    right           =>  Expression,
    operator        =>  string );

Expression `StaticMemberExpression` (
    ({ESTree})      =>  "MemberExpression",
    object          =>  Expression,
    property        =>  string );

Expression `ComputedMemberExpression` (
    ({ESTree})      =>  "MemberExpression",
    object          =>  Expression,
    property        =>  Expression);

Expression `NewExpression` (
    callee          =>  Expression,
    arguments       =>  array(Expression) );

Expression `ThisExpression` ( );

Expression `SequenceExpression` (
    expressions     =>  array(Expression) );

Expression `TaggedTemplateExpression` (
    tag             =>  Expression,
    quasi           =>  TemplateLiteral );

const Value = data `Value` (
    raw             =>  string,
    cooked          =>  string );

Expression `TemplateElement` (
    value           =>  Value,
    tail            =>  [boolean, false] );

Expression.TemplateElement.Value = Value;

Expression `TemplateLiteral` (
    expressions     =>  array(Expression),
    quasis          =>  array(Expression.TemplateElement) );

const UnaryExpression = Expression `UnaryExpression` (
    argument        =>  Expression,
    operator        =>  string,
    prefix          =>  [boolean, true] );

const YieldExpression = Expression `YieldExpression` (
    argument        =>  Expression);

const AwaitExpression = Expression `AwaitExpression` (
    argument        =>  Expression,
    delegate        =>  [boolean, false] );

module.exports = Expression;
