const { is, data, nullable, array, or, maybe } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union = require("@algebraic/type/union-new");
const Node = require("./node");
const { KeyPathsByName } = require("./key-path");
const compute = require("./compute");


exports.AssignmentExpression = Node `AssignmentExpression` (
    left                =>  Node.AssignmentTarget,
    right               =>  Node.Expression,
    operator            =>  string,
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `left.freeVariables`,
                                take => `right.freeVariables`,
                                take => `left.bindingNames` ) );

const Intrinsic = data `Intrinsic` (
    name                => string,
    keyword             => [nullable(string), null] );

exports.Intrinsic = Intrinsic;

exports.IntrinsicReference = Node `IntrinsicReference` (
    intrinsic           =>  Intrinsic,
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.IdentifierReference = Node `IdentifierReference` (
    ([ESTreeType])      =>  data.always ("Identifier"),
    name                =>  string,
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `name`) );

exports.ArrowFunctionExpression = Node `ArrowFunctionExpression` (
    body                =>  or (Node.BlockStatement, Node.Expression),
    ([id])              =>  data.always (null),

    parameters              =>  [array (Node.DefaultableBinding), []],
    restParameter           =>  [nullable (Node.RestElementBinding), null],

    ([generator])       =>  data.always (false),
    async               =>  [boolean, false],

    ([varBindings])     =>  KeyPathsByName.compute (
                                take => `params.bindingNames` ),

    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `body.freeVariables`,
                                take => `params.freeVariables`,
                                subtract => `varBindings` ) );

exports.FunctionExpression = Node `FunctionExpression` (
    body                =>  Node.BlockStatement,
    id                  =>  [nullable(Node.IdentifierBinding), null],

    parameters          =>  [array (Node.DefaultableBinding), []],
    restParameter       =>  [nullable (Node.RestElementBinding), null],

    generator           =>  [boolean, false],
    async               =>  [boolean, false],

    ([varBindings])     =>  KeyPathsByName.compute (
                                take => `id.bindingNames`,
                                take => `body.varBindingNames`,
                                take => `params.bindingNames`,
                                take => KeyPathsByName.just("arguments") ),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `body.freeVariables`,
                                take => `params.freeVariables`,
                                subtract => `varBindings` ) );

exports.ArrayExpression = Node `ArrayExpression` (
    elements            =>  array(or (
                                Node.Elision,
                                Node.Expression,
                                Node.SpreadElement)),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `elements.freeVariables`) );

exports.CallExpression = Node `CallExpression` (
    callee              =>  Node.Expression,
    arguments           =>  array(or (Node.Expression, Node.SpreadElement)),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `callee.freeVariables`,
                                take => `arguments.freeVariables` ) );

exports.ConditionalExpression = Node `ConditionalExpression` (
    test                =>  Node.Expression,
    consequent          =>  Node.Expression,
    alternate           =>  Node.Expression,
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `test.freeVariables` ,
                                take => `consequent.freeVariables`,
                                take => `alternate.freeVariables` ) );

exports.BinaryExpression = Node `BinaryExpression` (
    left                =>  Node.Expression,
    right               =>  Node.Expression,
    operator            =>  string,
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `left.freeVariables`,
                                take => `right.freeVariables` )  );

exports.LogicalExpression = Node `LogicalExpression` (
    left                =>  Node.Expression,
    right               =>  Node.Expression,
    operator            =>  string,
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `left.freeVariables`,
                                take => `right.freeVariables` ) );

exports.MemberExpression = Node `MemberExpression` (
    ([ESTreeType])      =>  data.always ("MemberExpression"),
    ([computed])        =>  [boolean, property =>
                                        is(Node.Expression, property)],

    object              =>  Node.Expression,
    property            =>  or (Node.Expression, Node.IdentifierName),
    optional            =>  [nullable(boolean), null],
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `object.freeVariables`) );
/*
exports.StaticMemberExpression = Node `StaticMemberExpression` (
    ([ESTreeType])      =>  data.always ("MemberExpression"),
    ([computed])        =>  data.always (false),

    object              =>  Node.Expression,
    property            =>  Node.PropertyName,
    optional            =>  [nullable(boolean), null],
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `object.freeVariables`) );

exports.ComputedMemberExpression = Node `ComputedMemberExpression` (
    ([ESTreeType])      =>  data.always ("MemberExpression"),
    ([computed])        =>  data.always (true),

    object              =>  Node.Expression,
    property            =>  Node.Expression,
    optional            =>  [nullable(boolean), null],
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `object.freeVariables`,
                                take => `property.freeVariables` ) );*/

//exports.MemberExpression = union2 `MemberExpression` (
//    is                  => Node.StaticMemberExpression,
//    or                  => Node.ComputedMemberExpression );

exports.NewExpression = Node `NewExpression` (
    callee              =>  Node.Expression,
    arguments           =>  array(or (Node.Expression, Node.SpreadElement)),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `callee.freeVariables`,
                                take => `arguments.freeVariables` ) );

exports.ThisExpression = Node `ThisExpression` (
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.SequenceExpression = Node `SequenceExpression` (
    expressions         =>  array(Node.Expression),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `expressions.freeVariables`) );

exports.TaggedTemplateExpression = Node `TaggedTemplateExpression` (
    tag                 =>  Node.Expression,
    quasi               =>  Node.TemplateLiteral,
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `tag.freeVariables`,
                                take => `quasi.freeVariables`) );

exports.UnaryExpression = Node `UnaryExpression` (
    argument            =>  Node.Expression,
    operator            =>  string,
    prefix              =>  [boolean, true],
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `argument.freeVariables`) );

exports.UpdateExpression = Node `UpdateExpression` (
    argument            =>  Node.Expression,
    operator            =>  string,
    prefix              =>  [boolean, true],
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `argument.freeVariables`) );

exports.YieldExpression = Node `YieldExpression` (
    argument            =>  Node.Expression,
    delegate            =>  [boolean, false],
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `argument.freeVariables`));

exports.AwaitExpression = Node `AwaitExpression` (
    argument            =>  Node.Expression,
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `argument.freeVariables`) );

exports.ObjectProperty = union `ObjectProperty` (
    is                  => Node.LonghandObjectProperty,
    or                  => Node.ShorthandObjectProperty );

exports.LonghandObjectProperty = Node `LonghandObjectProperty` (
    ([ESTreeType])      =>  data.always ("ObjectProperty"),

    ([shorthand])       =>  data.always (false),
    ([computed])        =>  [boolean, key =>
                                is(Node.ComputedPropertyName, key)],

    key                 =>  Node.PropertyName,
    value               =>  Node.Expression,

    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `key.freeVariables`,
                                take => `value.freeVariables` ) );

exports.ShorthandObjectProperty = Node `ShorthandObjectProperty` (
    ([ESTreeType])      =>  data.always ("ObjectProperty"),

    ([shorthand])       =>  data.always (true),
    ([computed])        =>  data.always (false),

    ([key])             =>  [Node.IdentifierName, value => Node.IdentifierName(value)],
    value               =>  Node.IdentifierReference,

    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `value.freeVariables`) );

exports.ObjectExpression = Node `ObjectExpression` (
    properties          => array ( or(Node.ObjectProperty, Node.SpreadElement)),
    ([freeVariables])   => KeyPathsByName.compute (
                                take => `properties.freeVariables`) );

exports.SpreadElement = Node `SpreadElement` (
    argument            => Node.Expression,
    ([freeVariables])   => KeyPathsByName.compute (
                            take => `argument.freeVariables`) );

exports.BranchExpression = Node `BranchExpression` (
    argument            => Node.Expression,
    ([freeVariables])   => KeyPathsByName.compute (
                            take => `argument.freeVariables`,
                            take => KeyPathsByName.just("branch")) )

/*exports.DeriveCallAndBranchExpression = Node `DeriveCallAndBranchExpression` (
    callee              => Node.Expression,
    ds                  => array(number),
    arguments           => array(or (Node.Expression, Node.SpreadElement)),
    ([freeVariables])   => KeyPathsByName.compute (
                            take => `callee.freeVariables` ) );
*/

Object.assign(exports, require("./literals"));
