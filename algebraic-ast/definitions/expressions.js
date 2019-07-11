const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const FreeVariables = require("./string-set").in `freeVariables`;


exports.AssignmentExpression = Node `AssignmentExpression` (
    left                =>  Node.RootPattern,
    right               =>  Node.Expression,
    operator            =>  string,
    ([freeVariables])   =>  FreeVariables.from("left", "right") );

exports.IdentifierExpression = Node `IdentifierExpression` (
    ({override:type})   =>  "Identifier",
    name                =>  string,
    ([freeVariables])   =>  FreeVariables.lift("name") );

exports.ArrowFunctionExpression = Node `ArrowFunctionExpression` (
    body                =>  or (Node.BlockStatment, Node.Expression),
    ([id])              =>  data.always (null),
    params              =>  array(nullable(Node.RootPattern)),

    ([generator])       =>  data.always (false),
    async               =>  [boolean, false],

    ([freeVariables])   =>  FreeVariables.from("body", "params") );

exports.FunctionExpression = Node `FunctionExpression` (
    body                =>  Node.BlockStatment,
    id                  =>  Node.IdentifierPattern,
    params              =>  array (nullable(Node.RootPattern)),

    generator           =>  [boolean, false],
    async               =>  [boolean, false],

    ([freeVariables])   =>  FreeVariables.from("body", "params") );

exports.ArrayExpression = Node `ArrayExpression` (
    elements            =>  array(Node.Expression),
    ([freeVariables])   =>  FreeVariables.from("elements") );

exports.CallExpression = Node `CallExpression` (
    callee              =>  Expression,
    arguments           =>  array(Expression),
    ([freeVariables])   =>  FreeVariables.from("callee", "arguments") );

exports.ConditionalExpression = Node `ConditionalExpression` (
    test                =>  Node.Expression,
    consequent          =>  Node.Expression,
    alternate           =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables
                                .from("test", "consequent", "alternate") );

exports.BinaryExpression = Node `BinaryExpression` (
    left                =>  Node.Expression,
    right               =>  Node.Expression,
    operator            =>  string,
    ([freeVariables])   =>  FreeVariables.from("left", "right")  );

exports.LogicalExpression = Node `LogicalExpression` (
    left                =>  Node.Expression,
    right               =>  Node.Expression,
    operator            =>  string,
    ([freeVariables])   =>  FreeVariables.from("left", "right") );

exports.StaticMemberExpression = Node `StaticMemberExpression` (
    ({override:type})   =>  "MemberExpression",
    ([computed])        =>  data.always (false),

    object              =>  Node.Expression,
    property            =>  Node.PropertyName,
    optional            =>  [nullable(boolean), null],
    ([freeVariables])   =>  FreeVariables.from("object") );

exports.ComputedMemberExpression = Node `ComputedMemberExpression` (
    ({override:type})   =>  "MemberExpression",
    ([computed])        =>  data.always (true),

    object              =>  Node.Expression,
    property            =>  Node.Expression,
    optional            =>  [nullable(boolean), null],
    ([freeVariables])   =>  FreeVariables.from("object", "property") );

exports.NewExpression = Node `NewExpression` (
    callee              =>  Node.Expression,
    arguments           =>  array(Node.Expression),
    ([freeVariables])   =>  FreeVariables.from("callee", "arguments") );

exports.ThisExpression = Node `ThisExpression` (
    ([freeVariables])   =>  FreeVariables.Never );

exports.SequenceExpression = Node `SequenceExpression` (
    expressions         =>  array(Node.Expression),
    ([freeVariables])   =>  FreeVariables.from("expressions") );

exports.TaggedTemplateExpression = Node `TaggedTemplateExpression` (
    tag                 =>  Node.Expression,
    quasi               =>  Node.TemplateLiteral,
    ([freeVariables])   =>  FreeVariables.from("tag", "quasi") );

exports.UnaryExpression = Node `UnaryExpression` (
    argument            =>  Node.Expression,
    operator            =>  string,
    prefix              =>  [boolean, true],
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.UpdateExpression = Node `UpdateExpression` (
    argument            =>  Node.Expression,
    operator            =>  string,
    prefix              =>  [boolean, true],
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.YieldExpression = Node `YieldExpression` (
    argument            =>  Node.Expression,
    delegate            =>  [boolean, false],
    ([freeVariables])   =>  FreeVariables.from("argument"));

exports.AwaitExpression = Node `AwaitExpression` (
    argument            =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.ObjectPropertyShorthand = data `ObjectPropertyShorthand` (
    ({override:type})   =>  "ObjectProperty",

    ([shorthand])       =>  data.always (true),
    ([computed])        =>  data.always (false),

    ([key])             =>  [Node.PropertyName, value => Node.PropertyName(value)],
    value               =>  Node.IdentifierExpression,

    ([freeVariables])   =>  FreeVariables.from("value") )

exports.ObjectPropertyLonghand = data `ObjectPropertyLonghand` (
    ({override:type})   =>  "ObjectProperty",

    ([shorthand])       =>  data.always (false),
    ([computed])        =>  [boolean, key =>
                                is(Node.ComputedPropertyName, key)],

    key                 =>  or (Node.ComputedPropertyName,
                                Node.PropertyName,
                                Node.StringLiteral),
    value               =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("key", "value") );

exports.ObjectProperty = union2 `ObjectProperty` (
    is                  => Node.ObjectPropertyLonghand,
    or                  => Node.ObjectPropertyShorthand );

exports.ObjectExpression = data `ObjectExpression` (
    properties          => array (Node.ObjectProperty),
    ([freeVariables])   => FreeVariables.from("properties") );

Object.assign(exports, require("./literals"));
    
    
    
    
    
