const { data, or, boolean, string, type, array } = require("@algebraic/type");
const union2 = require("@algebraic/type/union-new");


const always = value => [type.of(value), () => value];

const Node = require("./node");
const Bindings = require("./string-set").in `bindings`;
const FreeVariables = require("./string-set").in `freeVariables`;


exports.RootPattern =   union2 `RootPattern` (
    is                  =>  Node.IdentifierPattern,
    or                  =>  Node.ArrayPattern,
    or                  =>  Node.ObjectPattern );

// In order to maintain backwards compatibility with ESTree's spec, we set
// the type property to "Identifier". This makes this portion of the tree
// appear unchanged to Babel and other ESTree compatible tools.
exports.IdentifierPattern = data `IdentifierPattern` (
    ([type])            =>  always ("Identifier"),

    name                =>  string,
    ([bindings])        =>  Bindings.lift("name"),
    ([freeVariables])   =>  FreeVariables.lift("name") );

// Along with IdentifierPattern, RestElement is the "Binding Atom". These
// two properties are where all the bound names come from.
exports.RestElement = data `RestElement` (
    ([type])            =>  always ("RestElement"),

    argument            =>  Node.RootPattern,
    ([bindings])        =>  Bindings.from("argument"),
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.ArrayPattern = data `ArrayPattern` (
    ([type])            =>  always ("ArrayPattern"),

    elements            =>  (console.log(array, Node.RootPattern, Node),array(Node.RootPattern)),
    ([bindings])        =>  Bindings.from("elements"),
    ([freeVariables])   =>  FreeVariables.from("elements") );

// Babel has no concept of a ComputedProperyNamePattern at all, and so this
// would require significant conversion on the way back (unlike
// IdentifierPattern which just pretends to be an Identifier). However, we
// can do something similar here and pretend to be a ParenthesizedExpression.
exports.ComputedPropertyName = data `ComputedPropertyName` (
    ([type])            =>  always ("ParenthesizedExpression"),

    expression          =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("expression") );

exports.PropertyName = data `PropertyName` (
    ([type])            =>  always `Identifier`,

    name                =>  string,
    ([freeVariables])   =>  FreeVariables.Never );

exports.ShorthandAssignmentPattern = data `ShorthandAssignmentPattern` (
    ([type])            =>  always ("AssignmentPattern"),

    left                =>  Node.IdentifierPattern,
    right               =>  Node.Expression,
    ([bindings])        =>  Bindings.from("left"),
    ([freeVariables])   =>  FreeVariables.from("left", "right") );

exports.ShorthandPropertyPattern = data `ShorthandPropertyPattern` (
    ([type])            =>  always ("ObjectProperty"),

    ([shorthand])       =>  always (true),
    ([computed])        =>  always (false),

    ([key])             =>  [Node.PropertyName, value =>
                                is (Node.IdentifierPattern, value) ?
                                    Node.PropertyName(value) :
                                    Node.PropertyName(value.left)],
    value               =>  or (Node.IdentifierPattern,
                                Node.ShorthandAssignmentPattern ),

    ([bindings])        =>  Bindings.from("value"),
    ([freeVariables])   =>  FreeVariables.from("value") );

exports.ObjectPropertyPattern = data `ObjectPropertyPattern` (
    ([type])            =>  always ("ObjectProperty"),

    ([shorthand])       =>  always (false),
    ([computed])        =>  [boolean, key => is(Node.ComputedPropertyName, key)],

    key                 =>  or (Node.ComputedPropertyName,
                                Node.PropertyName, 
                                Node.StringLiteral),
    value               =>  Node.RootPattern,

    ([bindings])        =>  Bindings.from("value"),
    ([freeVariables])   =>  FreeVariables.from("key", "value") );

exports.ObjectPattern = data `ObjectPattern` (
    ([type])            =>  always ("ObjectPattern"),

    properties          =>  array(ObjectPropertyPattern),
    ([bindings])        =>  Bindings.from("properties"),
    ([freeVariables])   =>  FreeVariables.from("properties") );

