const { is, data, or, string, array, nullable, boolean } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const Node = require("./node");
const given = f => f();

// https://tc39.es/ecma262/#prod-DestructuringAssignmentTarget
// https://tc39.es/ecma262/#sec-static-semantics-assignmenttargettype
//
// FIXME: We need parenthesized expression too...
//
exports.AssignmentTarget = union `AssignmentTarget` (
    is                  =>  Node.IdentifierReference,
    or                  =>  Node.MemberExpression,
    or                  =>  Node.ArrayAssignmentTarget,
    or                  =>  Node.ObjectAssignmentTarget );

exports.AssignableReference = union `AssignableReference` (
    is                  =>  Node.IdentifierReference,
    or                  =>  Node.MemberExpression );

exports.DefaultedAssignmentTarget = Node `DefaultedAssignmentTarget` (
    target              =>  Node.AssignmentTarget,
    fallback            =>  Node.Expression );

exports.DefaultableAssignmentTarget = union `DefaultableAssignmentTarget` (
    is                  =>  Node.AssignmentTarget,
    or                  =>  Node.DefaultedAssignmentTarget );


exports.ArrayAssignmentTarget = Node `ArrayAssignmentTarget` (
    elements            =>  array (Node.ArrayElementAssignmentTarget),
    restElement         =>  nullable (Node.RestElementAssignmentTarget) );

exports.ArrayElementAssignmentTarget = union `ArrayElementAssignmentTarget` (
    is                  =>  Node.Elision,
    or                  =>  Node.DefaultableAssignmentTarget );

exports.RestElementAssignmentTarget = Node `RestElementAssignmentTarget` (
    argument            =>  Node.AssignmentTarget );

// ?

exports.ObjectAssignmentTarget = Node `ObjectAssignmentTarget` (
    properties          =>  array (Node.PropertyAssignmentTarget),
    restProperty        =>  nullable (Node.RestPropertyAssignmentTarget) );

exports.PropertyAssignmentTarget = union `PropertyAssignmentTarget` (
    is                  =>  Node.LonghandPropertyAssignmentTarget,
    or                  =>  Node.ShorthandPropertyAssignmentTarget );

const getUndefaultedTarget = target =>
    is (Node.DefaultedAssignmentTarget, target) ?
        target.target : target;

exports.PropertyAssignmentTarget = Node `PropertyAssignmentTarget` (
    ([computed])        =>  [boolean, key => is(Node.ComputedPropertyName, key)],

    ([canBeShorthand])  =>  [boolean, (key, target) => given((
                                receiver = getUndefaultedTarget(target)) =>
                                is (Node.IdentifierName, key) &&
                                is (Node.IdentifierReference, receiver) &&
                                key.name === receiver.name)],

    ([shorthand])       =>  [boolean, (canBeShorthand, prefersShorthand) =>
                                canBeShorthand && prefersShorthand],

    prefersShorthand    =>  [boolean, true],

    key                 =>  Node.PropertyName,
    target              =>  Node.DefaultableAssignmentTarget );

exports.RestPropertyAssignmentTarget = Node `RestPropertyAssignmentTarget` (
    argument            =>  Node.AssignableReference );

