const { data, or, string, array, nullable, boolean } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const Node = require("./node");

// https://tc39.es/ecma262/#prod-DestructuringAssignmentTarget
// https://tc39.es/ecma262/#sec-static-semantics-assignmenttargettype
//
// FIXME: We need parenthesized expression too...
//
exports.AssignmentTarget = union `AssignmentTarget` (
    is                  =>  Node.IdentifierExpression/*Reference*/,
    or                  =>  Node.MemberExpression,
    or                  =>  Node.ArrayAssignmentTarget,
    or                  =>  Node.ObjectAssignmentTarget );

exports.AssignableReference = union `AssignableReference` (
    is                  =>  Node.IdentifierExpression/*Reference*/,
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

exports.PropertyAssignmentTarget = Node `PropertyAssignmentTarget` (
    shorthand           =>  [boolean, false],
    key                 =>  Node.PropertyName,
    target              =>  Node.DefaultableAssignmentTarget );

exports.RestPropertyAssignmentTarget = Node `RestPropertyAssignmentTarget` (
    argument            =>  Node.AssignableReference );

