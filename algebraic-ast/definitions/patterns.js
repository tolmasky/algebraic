const { is, data, or, boolean, string, type, array } = require("@algebraic/type");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const Bindings = require("./string-set").in `bindings`;
const FreeVariables = require("./string-set").in `freeVariables`;


exports.RootPattern = union2 `RootPattern` (
    is                  =>  Node.IdentifierPattern,
    or                  =>  Node.ArrayPattern,
    or                  =>  Node.ObjectPattern );

// In order to maintain backwards compatibility with ESTree's spec, we set
// the type property to "Identifier". This makes this portion of the tree
// appear unchanged to Babel and other ESTree compatible tools.
exports.IdentifierPattern = Node `IdentifierPattern` (
    ({override:type})   => "Identifier",

    name                =>  string,
    ([bindings])        =>  Bindings.lift("name"),
    ([freeVariables])   =>  FreeVariables.lift("name") );

exports.RestElement = Node `RestElement` (
    argument            =>  Node.RootPattern,
    ([bindings])        =>  Bindings.from("argument"),
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.AssignmentPattern = Node `AssignmentPattern` (
    left                =>  Node.RootPattern,
    right               =>  Node.Expression,
    ([bindings])        =>  Bindings.from("left"),
    ([freeVariables])   =>  FreeVariables.from("left", "right") )

exports.ArrayPattern = Node `ArrayPattern` (
    elements            =>  array (or (Node.RootPattern, Node.AssignmentPattern)),
    ([bindings])        =>  Bindings.from("elements"),
    ([freeVariables])   =>  FreeVariables.from("elements") );

exports.ShorthandAssignmentPattern = Node `ShorthandAssignmentPattern` (
    ({override:type})   =>  "AssignmentPattern",

    left                =>  Node.IdentifierPattern,
    right               =>  Node.Expression,
    ([bindings])        =>  Bindings.from("left"),
    ([freeVariables])   =>  FreeVariables.from("left", "right") );

exports.ObjectPropertyPatternShorthand = Node `ObjectPropertyPatternShorthand` (
    ({override:type})   =>  "ObjectProperty",

    ([shorthand])       =>  data.always (true),
    ([computed])        =>  data.always (false),

    ([key])             =>  [Node.PropertyName, value =>
                                is (Node.IdentifierPattern, value) ?
                                    Node.PropertyName(value) :
                                    Node.PropertyName(value.left)],
    value               =>  or (Node.IdentifierPattern,
                                Node.ShorthandAssignmentPattern ),

    ([bindings])        =>  Bindings.from("value"),
    ([freeVariables])   =>  FreeVariables.from("value") );

exports.ObjectPropertyPatternLonghand = Node `ObjectPropertyPatternLonghand` (
    ({override:type})   =>  "ObjectProperty",

    ([shorthand])       =>  data.always (false),
    ([computed])        =>  [boolean, key =>
                                is(Node.ComputedPropertyName, key)],

    key                 =>  or (Node.ComputedPropertyName,
                                Node.PropertyName,
                                Node.StringLiteral),
    value               =>  or (Node.RootPattern,
                                Node.AssignmentPattern),

    ([bindings])        =>  Bindings.from("value"),
    ([freeVariables])   =>  FreeVariables.from("key", "value") );

exports.ObjectPropertyPattern = union2 `ObjectPropertyPattern` (
    is                  => Node.ObjectPropertyPatternLonghand,
    or                  => Node.ObjectPropertyPatternShorthand );

exports.ObjectPattern = Node `ObjectPattern` (
    properties          =>  array (Node.ObjectPropertyPattern ),
    ([bindings])        =>  Bindings.from("properties"),
    ([freeVariables])   =>  FreeVariables.from("properties") );

