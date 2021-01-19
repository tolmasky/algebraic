const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");


exports.AssignmentExpression = Node `AssignmentExpression` (
    left                =>  or (Node.IdentifierExpression,
                                Node.MemberExpression,
                                Node.ArrayPattern,
                                Node.ObjectPattern),
    right               =>  Node.Expression,
    operator            =>  string );

exports.IdentifierExpression = Node `IdentifierExpression` (
    ([ESTreeType])      =>  data.always ("Identifier"),
    name                =>  string );

exports.ArrowFunctionExpression = Node `ArrowFunctionExpression` (
    body                =>  or (Node.BlockStatement, Node.Expression),
    ([id])              =>  data.always (null),
    params              =>  [array(nullable(Node.RootPattern)), []],

    ([generator])       =>  data.always (false),
    async               =>  [boolean, false] );

exports.FunctionExpression = Node `FunctionExpression` (
    body                =>  Node.BlockStatement,
    id                  =>  [nullable(Node.IdentifierPattern), null],
    params              =>  [array (nullable(Node.RootPattern)), []],

    generator           =>  [boolean, false],
    async               =>  [boolean, false] );

exports.ArrayExpression = Node `ArrayExpression` (
    elements            =>  array(nullable(or (
                                Node.Expression, Node.SpreadElement))) );

exports.CallExpression = Node `CallExpression` (
    callee              =>  Node.Expression,
    arguments           =>  array(or (Node.Expression, Node.SpreadElement)) );

exports.ConditionalExpression = Node `ConditionalExpression` (
    test                =>  Node.Expression,
    consequent          =>  Node.Expression,
    alternate           =>  Node.Expression );

exports.BinaryExpression = Node `BinaryExpression` (
    left                =>  Node.Expression,
    right               =>  Node.Expression,
    operator            =>  string );

exports.LogicalExpression = Node `LogicalExpression` (
    left                =>  Node.Expression,
    right               =>  Node.Expression,
    operator            =>  string );

exports.StaticMemberExpression = Node `StaticMemberExpression` (
    ([ESTreeType])      =>  data.always ("MemberExpression"),
    ([computed])        =>  data.always (false),

    object              =>  Node.Expression,
    property            =>  Node.PropertyName,
    optional            =>  [nullable(boolean), null] );

exports.ComputedMemberExpression = Node `ComputedMemberExpression` (
    ([ESTreeType])      =>  data.always ("MemberExpression"),
    ([computed])        =>  data.always (true),

    object              =>  Node.Expression,
    property            =>  Node.Expression,
    optional            =>  [nullable(boolean), null] );

exports.MemberExpression = union2 `MemberExpression` (
    is                  => Node.StaticMemberExpression,
    or                  => Node.ComputedMemberExpression );

exports.NewExpression = Node `NewExpression` (
    callee              =>  Node.Expression,
    arguments           =>  array(or (Node.Expression, Node.SpreadElement)) );

exports.ThisExpression = Node `ThisExpression` ( );

exports.SequenceExpression = Node `SequenceExpression` (
    expressions         =>  array(Node.Expression) );

exports.TaggedTemplateExpression = Node `TaggedTemplateExpression` (
    tag                 =>  Node.Expression,
    quasi               =>  Node.TemplateLiteral );

exports.UnaryExpression = Node `UnaryExpression` (
    argument            =>  Node.Expression,
    operator            =>  string,
    prefix              =>  [boolean, true] );

exports.UpdateExpression = Node `UpdateExpression` (
    argument            =>  Node.Expression,
    operator            =>  string,
    prefix              =>  [boolean, true] );

exports.YieldExpression = Node `YieldExpression` (
    argument            =>  Node.Expression,
    delegate            =>  [boolean, false] );

exports.AwaitExpression = Node `AwaitExpression` (
    argument            =>  Node.Expression );

exports.ObjectPropertyShorthand = Node `ObjectPropertyShorthand` (
    ([ESTreeType])      =>  data.always ("ObjectProperty"),

    ([shorthand])       =>  data.always (true),
    ([computed])        =>  data.always (false),

    ([key])             =>  [Node.PropertyName, value => Node.PropertyName(value)],
    value               =>  Node.IdentifierExpression );

exports.ObjectPropertyLonghand = Node `ObjectPropertyLonghand` (
    ([ESTreeType])      =>  data.always ("ObjectProperty"),

    ([shorthand])       =>  data.always (false),
    ([computed])        =>  [boolean, key =>
                                is(Node.ComputedPropertyName, key)],

    key                 =>  or (Node.ComputedPropertyName,
                                Node.PropertyName,
                                Node.StringLiteral),
    value               =>  Node.Expression );

exports.ObjectProperty = union2 `ObjectProperty` (
    is                  => Node.ObjectPropertyLonghand,
    or                  => Node.ObjectPropertyShorthand );

exports.ObjectExpression = Node `ObjectExpression` (
    properties          => array ( or(Node.ObjectProperty, Node.SpreadElement)) );

exports.SpreadElement = Node `SpreadElement` (
    argument            => Node.Expression );

Object.assign(exports, require("./literals"));
    
    
    
    
    
