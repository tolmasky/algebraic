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

    parameters          =>  [array (Node.DefaultableBinding), []],
    restParameter       =>  [nullable (Node.RestElementBinding), null],

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

// NOTE: I originally split ObjectProperty up into Longhand and Shorthand
// variants to try to make it impossible to construct impossible properties
// (like "shorthand" properties where the binding *isn't* an identifier
// binding), but this becomes cumbersome to interact with when actually
// manipulating the AST. The root of the problem is that shorthand properties
// (and their Binding and AssignmentTarget relatives) appear to have the
// (unique?) distinction of being a purely syntactic features with no semantic
// differences from normal properties. As such, it is strange to give them a
// semantic desgination in the AST.
//
// In order to balance the desire to not have impossible ASTs *and* provide
// an ergonomic interface, I settled on having a user-settable
// "prefersShorthand" property, with "canBeShorthand" and "shorthand" *computed*
// properties. When prefersShorthand is true and canBeShorthand evaluates to
// true, the code pritner will generate shorthand properties, but otherwise
// there is no real difference with interacting with these objects. We default
// the "prefersShorthand" property to true so that by default we always generate
// compact properties whenever possible. Upon parsing, "prefersShorthand" will
// be true when the target source's author chose the shorthand, so that if you
// perform a series of operations that lead to it still being shorthandable, it
// will be.

exports.ObjectProperty = Node `ObjectProperty` (
    ([computed])        =>  [boolean, key => is(Node.ComputedPropertyName, key)],

    ([canBeShorthand])  =>  [boolean, (key, value) =>
                                is (Node.IdentifierName, key) &&
                                is (Node.IdentifierReference, value) &&
                                key.name === value.name],

    ([shorthand])       =>  [boolean, (canBeShorthand, prefersShorthand) =>
                                canBeShorthand && prefersShorthand],

    prefersShorthand    =>  [boolean, true],

    key                 =>  Node.PropertyName,
    value               =>  Node.Expression,

    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `key.freeVariables`,
                                take => `value.freeVariables` ) );

exports.ObjectExpression = Node `ObjectExpression` (
    properties          => array ( or(Node.ObjectProperty, Node.SpreadElement)),
    ([freeVariables])   => KeyPathsByName.compute (
                                take => `properties.freeVariables`) );

exports.SpreadElement = Node `SpreadElement` (
    argument            => Node.Expression,
    ([freeVariables])   => KeyPathsByName.compute (
                            take => `argument.freeVariables`) );

Object.assign(exports, require("./literals"));
