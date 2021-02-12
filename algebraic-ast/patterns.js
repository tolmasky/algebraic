const { is, data, or, string, array, nullable, boolean } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const Node = require("./node");
const given = f => f();


// In order to maintain backwards compatibility with ESTree's spec, we set
// the type property to "Identifier". This makes this portion of the tree
// appear unchanged to Babel and other ESTree compatible tools.
exports.IdentifierBinding = Node `IdentifierBinding` (
    ([ESTreeType])      =>  data.always ("Identifier"),
    name                =>  string );

exports.Binding = union `Binding` (
    is                  =>  Node.PatternBinding,
    or                  =>  Node.IdentifierBinding );

exports.DefaultedBinding = Node `DefaultedBinding` (
    binding             =>  Node.Binding,
    fallback            =>  Node.Expression );

exports.DefaultableBinding = union `DefaultableBinding` (
    is                  =>  Node.Binding,
    or                  =>  Node.DefaultedBinding );

exports.PatternBinding = union `PatternBinding` (
    is                  =>  Node.ObjectPatternBinding,
    or                  =>  Node.ArrayPatternBinding );

exports.ObjectPatternBinding = Node `ObjectPatternBinding` (
    properties          =>  array (Node.PropertyBinding),
    restProperty        =>  nullable (Node.RestPropertyBinding) );

exports.ArrayElementBinding = union `ArrayElementBinding` (
    is                  =>  Node.Elision,
    or                  =>  Node.DefaultableBinding );

exports.ArrayPatternBinding = Node `ArrayPatternBinding` (
    elements            =>  array (Node.ArrayElementBinding),
    restElement         =>  nullable (Node.RestElementBinding) );

exports.RestElementBinding = Node `RestElementBinding` (
    argument            =>  Node.Binding );

exports.RestPropertyBinding = Node `RestPropertyBinding` (
    argument            =>  Node.IdentifierBinding );

exports.Elision = Node `Elision` ();

const getUndefaultedBinding = binding =>
    is (Node.DefaultedBinding, binding) ?
        binding.binding : binding;

exports.PropertyBinding = Node `PropertyBinding` (
    ([computed])        =>  [boolean, key =>
                                is(Node.ComputedPropertyName, key)],

    ([canBeShorthand])  =>  [boolean, (key, binding) => given((
                                receiver = getUndefaultedBinding(binding)) =>
                                is (Node.IdentifierName, key) &&
                                is (Node.IdentifierBinding, receiver) &&
                                key.name === receiver.name)],

    ([shorthand])       =>  [boolean, (canBeShorthand, prefersShorthand) =>
                                canBeShorthand && prefersShorthand],
    prefersShorthand    =>  [boolean, true],

    key                 =>  Node.PropertyName,
    binding             =>  Node.DefaultableBinding );

/*
    ([canBeShorthand])  =>  [boolean, (key, binding) =>
                                is (Node.IdentifierName, key) && given((
                                receiver = getUndefaultedBinding(binding)) =>
                                is (Node.IdentifierBinding, receiver) &&
                                receiver.name === key.name),
*/

/*
exports.PropertyBinding = union `PropertyBinding` (
    is                  =>  Node.ShorthandPropertyBinding,
    or                  =>  Node.LonghandPropertyBinding );

exports.ShorthandPropertyBinding = Node `ShorthandPropertyBinding` (
    binding             =>  Node.DefaultableIdentifierBinding );

exports.LonghandPropertyBinding = Node `LonghandPropertyBinding` (
    key                 =>  Node.PropertyName,
    binding             =>  Node.DefaultableBinding );
*/

// DefaultableBinding = TC39.BindingElement
// https://tc39.es/ecma262/#prod-BindingElement
//
/*exports.DefaultableBinding = union `DefaultableBinding` (
    is                  =>  Node.DefaultableIdentifierBinding,
    or                  =>  Node.DefaultablePatternBinding );*/
/*
const Defaulted = parameterized (T =>
    Node ([`Defaulted<${type.name(T)}>`]) (
        binding             => T,
        fallback            => Node.Expression ) );

const Defaultable = parameterized (T =>
    union `Defaultable<${T}>` (
        is                  => T,
        or                  => Defaulted(T) ) );


exports.DefaultedIdentifierBinding = Defaulted(exports.IdentifierBinding);

exports.DefaultableIdentifierBinding = Defaultable(exports.IdentifierBinding);

exports.DefaultedBinding = Defaulted(exports.Binding);

exports.DefaultableBinding = Defaultable(exports.Binding);

exports.DefaultedPatternBinding = Node `DefaultedPatternBinding` (
    pattern             => Node.PatternBinding,
    fallback            => Node.Expression );

exports.DefaultablePatternBinding = union `DefaultablePatternBinding` (
    is                  => Node.PatternBinding,
    or                  => Node.DefaultedPatternBinding );*/

/*exports.DefaultedIdentifierBinding = Node `DefaultedIdentifierBinding` (
    identifier          => Node.IdentifierBinding,
    fallback            => Node.Expression );

exports.DefaultableIdentifierBinding = union `DefaultableIdentifierBinding` (
    is                  =>  Node.IdentifierBinding,
    or                  =>  Node.DefaultedIdentifierBinding );*/

/*

const union2 = require("@algebraic/type/union-new");

const { KeyPathsByName } = require("./key-path");


exports.RootPattern = union2 `RootPattern` (
    is                  =>  Node.IdentifierPattern,
    or                  =>  Node.ArrayPattern,
    or                  =>  Node.ObjectPattern );

// In order to maintain backwards compatibility with ESTree's spec, we set
// the type property to "Identifier". This makes this portion of the tree
// appear unchanged to Babel and other ESTree compatible tools.
exports.IdentifierPattern = Node `IdentifierPattern` (
    ([ESTreeType])      =>  data.always ("Identifier"),

    name                =>  string,
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `name`),
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.RestElement = Node `RestElement` (
    argument            =>  Node.RootPattern,
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `argument.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `argument.freeVariables`) );

exports.AssignmentPattern = Node `AssignmentPattern` (
    left                =>  Node.RootPattern,
    right               =>  Node.Expression,
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `left.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `left.freeVariables`,
                                take => `right.freeVariables` ) );

exports.ArrayPattern = Node `ArrayPattern` (
    elements            =>  array (or (Node.RootPattern, Node.AssignmentPattern)),
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `elements.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `elements.freeVariables`) );

exports.ShorthandAssignmentPattern = Node `ShorthandAssignmentPattern` (
    ([ESTreeType])      =>  data.always ("AssignmentPattern"),

    left                =>  Node.IdentifierPattern,
    right               =>  Node.Expression,
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `left.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `left.freeVariables`,
                                take => `right.freeVariables` ));

exports.ObjectPropertyPatternShorthand = Node `ObjectPropertyPatternShorthand` (
    ([ESTreeType])      =>  data.always ("ObjectProperty"),

    ([shorthand])       =>  data.always (true),
    ([computed])        =>  data.always (false),

    ([key])             =>  [Node.PropertyName, value =>
                                is (Node.IdentifierPattern, value) ?
                                    Node.PropertyName(value) :
                                    Node.PropertyName(value.left)],
    value               =>  or (Node.IdentifierPattern,
                                Node.ShorthandAssignmentPattern ),

    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `value.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `value.freeVariables`) );

exports.ObjectPropertyPatternLonghand = Node `ObjectPropertyPatternLonghand` (
    ([ESTreeType])      =>  data.always ("ObjectProperty"),

    ([shorthand])       =>  data.always (false),
    ([computed])        =>  [boolean, key =>
                                is(Node.ComputedPropertyName, key)],

    key                 =>  or (Node.ComputedPropertyName,
                                Node.PropertyName,
                                Node.StringLiteral),
    value               =>  or (Node.RootPattern,
                                Node.AssignmentPattern),

    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `value.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `left.freeVariables`,
                                take => `right.freeVariables`) );

exports.ObjectPropertyPattern = union2 `ObjectPropertyPattern` (
    is                  => Node.ObjectPropertyPatternLonghand,
    or                  => Node.ObjectPropertyPatternShorthand );

exports.ObjectPattern = Node `ObjectPattern` (
    properties          =>  array (Node.ObjectPropertyPattern ),
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `properties.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `properties.freeVariables`) );
*/
