const { is, data, or, boolean, string, type, array } = require("@algebraic/type");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const { StringSet } = require("./string-set");
const compute = require("./compute");


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
    ([bindingNames])    =>  compute (StringSet,
                                take => `name`),
    ([freeVariables])   =>  compute.empty (StringSet) );

exports.RestElement = Node `RestElement` (
    argument            =>  Node.RootPattern,
    ([bindingNames])    =>  compute (StringSet,
                                take => `argument.bindingNames`),
    ([freeVariables])   =>  compute (StringSet,
                                take => `argument.freeVariables`) );

exports.AssignmentPattern = Node `AssignmentPattern` (
    left                =>  Node.RootPattern,
    right               =>  Node.Expression,
    ([bindingNames])    =>  compute (StringSet,
                                take => `left.bindingNames`),
    ([freeVariables])   =>  compute (StringSet,
                                take => `left.freeVariables`,
                                take => `right.freeVariables` ) );

exports.ArrayPattern = Node `ArrayPattern` (
    elements            =>  array (or (Node.RootPattern, Node.AssignmentPattern)),
    ([bindingNames])    =>  compute (StringSet,
                                take => `elements.bindingNames`),
    ([freeVariables])   =>  compute (StringSet,
                                take => `elements.freeVariables`) );

exports.ShorthandAssignmentPattern = Node `ShorthandAssignmentPattern` (
    ({override:type})   =>  "AssignmentPattern",

    left                =>  Node.IdentifierPattern,
    right               =>  Node.Expression,
    ([bindingNames])    =>  compute (StringSet,
                                take => `left.bindingNames`),
    ([freeVariables])   =>  compute (StringSet,
                                take => `left.freeVariables`,
                                take => `right.freeVariables` ));

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

    ([bindingNames])    =>  compute (StringSet,
                                take => `value.bindingNames`),
    ([freeVariables])   =>  compute (StringSet,
                                take => `value.freeVariables`) );

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

    ([bindingNames])    =>  compute (StringSet,
                                take => `value.bindingNames`),
    ([freeVariables])   =>  compute (StringSet,
                                take => `left.freeVariables`,
                                take => `right.freeVariables`) );

exports.ObjectPropertyPattern = union2 `ObjectPropertyPattern` (
    is                  => Node.ObjectPropertyPatternLonghand,
    or                  => Node.ObjectPropertyPatternShorthand );

exports.ObjectPattern = Node `ObjectPattern` (
    properties          =>  array (Node.ObjectPropertyPattern ),
    ([bindingNames])    =>  compute (StringSet,
                                take => `properties.bindingNames`),
    ([freeVariables])   =>  compute (StringSet,
                                take => `properties.freeVariables`) );

