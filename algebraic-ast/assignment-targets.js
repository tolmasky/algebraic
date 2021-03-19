const type = require("@algebraic/type");
const Node = require("./node");
const given = f => f();

// https://tc39.es/ecma262/#prod-DestructuringAssignmentTarget
// https://tc39.es/ecma262/#sec-static-semantics-assignmenttargettype
//
// FIXME: We need parenthesized expression too...
//
exports.AssignmentTarget = type.union `AssignmentTarget` (
    of                  =>  Node.IdentifierReference,
    of                  =>  Node.MemberExpression,
    of                  =>  Node.ArrayAssignmentTarget,
    of                  =>  Node.ObjectAssignmentTarget );

exports.AssignableReference = type.union `AssignableReference` (
    of                  =>  Node.IdentifierReference,
    of                  =>  Node.MemberExpression );

exports.DefaultedAssignmentTarget = Node `DefaultedAssignmentTarget`
({
    target              :of =>  Node.AssignmentTarget,
    default             :of =>  Node.Expression
});

exports.DefaultableAssignmentTarget = type.union `DefaultableAssignmentTarget` (
    of                  =>  Node.AssignmentTarget,
    of                  =>  Node.DefaultedAssignmentTarget );


exports.ArrayAssignmentTarget = Node `ArrayAssignmentTarget`
({
    elements            :of =>  array (Node.ArrayElementAssignmentTarget),
    restElement         :of =>  Node.RestElementAssignmentTarget `?`
});

exports.ArrayElementAssignmentTarget = type.union `ArrayElementAssignmentTarget` (
    of                  =>  Node.Elision,
    of                  =>  Node.DefaultableAssignmentTarget );

exports.RestElementAssignmentTarget = Node `RestElementAssignmentTarget`
({
    argument            :of =>  Node.AssignmentTarget
});

// ?

exports.ObjectAssignmentTarget = Node `ObjectAssignmentTarget`
({
    properties          :of =>  array (Node.PropertyAssignmentTarget),
    restProperty        :of =>  Node.RestPropertyAssignmentTarget `?`
});

exports.PropertyAssignmentTarget = type.union `PropertyAssignmentTarget` (
    is                  =>  Node.LonghandPropertyAssignmentTarget,
    or                  =>  Node.ShorthandPropertyAssignmentTarget );

const getUndefaultedTarget = target =>
    is (Node.DefaultedAssignmentTarget, target) ?
        target.target : target;

exports.PropertyAssignmentTarget = Node `PropertyAssignmentTarget`
({
    computed            :of =>  type.boolean `()=` (({ key }) =>
                                    type.belongs(Node.ComputedPropertyName, key)),

    canBeShorthand      :of =>  type.boolean `()=` (({ key, target }) => given((
                                    receiver = getUndefaultedTarget(target)) =>
                                    type.belongs (Node.IdentifierName, key) &&
                                    type.belongs (Node.IdentifierReference, receiver) &&
                                    key.name === receiver.name)),

    shorthand           :of =>  type.boolean `()=`
                                    (({ canBeShorthand, prefersShorthand }) =>
                                        canBeShorthand && prefersShorthand),

    prefersShorthand    :of =>  type.boolean `=` (true),

    key                 :of =>  Node.PropertyName,
    target              :of =>  Node.DefaultableAssignmentTarget
});

exports.RestPropertyAssignmentTarget = Node `RestPropertyAssignmentTarget`
({
    argument            :of =>  Node.AssignableReference
});
