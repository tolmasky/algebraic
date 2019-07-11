const { data, boolean, number, string, nullable, parameterized } = require("@algebraic/type");
const Node = require("./node");
const FreeVariables = require("./string-set").in `freeVariables`;


exports.AssignmentExpression = data `AssignmentExpression` (
    ([type])            =>  data.always ("AssignmentExpression"),
    left                =>  Node.RootPattern,
    right               =>  Node.Expression,
    operator            =>  string,
    ([freeVariables])   =>  FreeVariables.from("left", "right") );

//({free:name})   =>  string
exports.IdentifierExpression = data `IdentifierExpression` (
    ([type])            =>  data.always ("Identifier"),
    name                =>  string,
    ([freeVariables])   =>  FreeVariables.lift("name") );

exports.ArrowFunctionExpression = data `ArrowFunctionExpression` (
    ([type])            =>  data.always ("ArrowFunctionExpression"),

    body                =>  Node.Expression,
    id                  =>  data.always (null),
    params              =>  array(nullable(Node.RootPattern)),

    ([generator])       =>  data.always (false),
    async               =>  [boolean, false],

    ([freeVariables])   =>  FreeVariables.from("body", "params") );

exports.ArrayExpression = data `ArrayExpression` (
    ([type])            =>  data.always ("ArrayExpression"),
    elements            =>  array(Node.Expression),
    ([freeVariables])   =>  FreeVariables.from("elements") );

exports.CallExpression = data `CallExpression` (
    ([type])            =>  data.always ("CallExpression"),
    callee              =>  Expression,
    arguments           =>  array(Expression),
    ([freeVariables])   =>  FreeVariables.from("callee", "arguments") );

exports.ConditionalExpression = data `ConditionalExpression` (
    ([type])            =>  data.always ("ConditionalExpression"),
    test                =>  Node.Expression,
    consequent          =>  Node.Expression,
    alternate           =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables
                                .from("test", "consequent", "alternate") );

exports.BinaryExpression = data `BinaryExpression` (
    ([type])            =>  data.always ("BinaryExpression"),
    left                =>  Node.Expression,
    right               =>  Node.Expression,
    operator            =>  string,
    ([freeVariables])   =>  FreeVariables.from("left", "right")  );

exports.LogicalExpression = data `LogicalExpression` (
    ([type])            =>  data.always ("LogicalExpression"),
    left                =>  Node.Expression,
    right               =>  Node.Expression,
    operator            =>  string,
    ([freeVariables])   =>  FreeVariables.from("left", "right") );

exports.StaticMemberExpression = data `StaticMemberExpression` (
    ([type])            =>  data.always ("MemberExpression"),
    ([computed])        =>  data.always (false),

    object              =>  Node.Expression,
    property            =>  Node.PropertyName,
    optional            =>  [nullable(boolean), null],
    ([freeVariables])   =>  FreeVariables.from("object") );

exports.ComputedMemberExpression = data `ComputedMemberExpression` (
    ([type])            =>  data.always ("MemberExpression"),
    ([computed])        =>  data.always (true),

    object              =>  Node.Expression,
    property            =>  Node.Expression,
    optional            =>  [nullable(boolean), null],
    ([freeVariables])   =>  FreeVariables.from("object", "property") );

exports.NewExpression = data `NewExpression` (
    ([type])            =>  data.always ("NewExpression"),
    callee              =>  Node.Expression,
    arguments           =>  array(Node.Expression),
    ([freeVariables])   =>  FreeVariables.from("callee", "arguments") );

exports.ThisExpression = data `ThisExpression` (
    ([type])            =>  data.always ("ThisExpression"),
    ([freeVariables])   =>  FreeVariables.Never );

exports.SequenceExpression = data `SequenceExpression` (
    ([type])            =>  data.always ("SequenceExpression"),
    expressions         =>  array(Node.Expression),
    ([freeVariables])   =>  FreeVariables.from("expressions") );

exports.TaggedTemplateExpression = data `TaggedTemplateExpression` (
    ([type])            =>  data.always ("TaggedTemplateExpression"),
    tag                 =>  Node.Expression,
    quasi               =>  Node.TemplateLiteral,
    ([freeVariables])   =>  FreeVariables.from("tag", "quasi") );

exports.UnaryExpression = data `UnaryExpression` (
    ([type])            =>  data.always ("UnaryExpression"),
    argument            =>  Node.Expression,
    operator            =>  string,
    prefix              =>  [boolean, true],
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.YieldExpression = data `YieldExpression` (
    ([type])            =>  data.always ("YieldExpression"),
    argument            =>  Node.Expression,
    delegate            =>  [boolean, false],
    ([freeVariables])   =>  FreeVariables.from("argument"));

exports.AwaitExpression = data `AwaitExpression` (
    ([type])            =>  data.always ("AwaitExpression"),
    argument            =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("argument") );

Object.assign(exports, require("./literals"));
    
    
    
    
    
