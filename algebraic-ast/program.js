const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const { KeyPathsByName } = require("./key-path");
const Extra = require("./extra");


exports.Directive = Node `Directive` (
    value               => Node.DirectiveLiteral );

exports.DirectiveLiteral = Node `DirectiveLiteral` (
    value               => string,
    extra               => [nullable(Extra(string)), null] );

exports.InterpreterDirective = Node `InterpreterDirective` (
    value               => string );

exports.Script = Node `Script` (
    ([ESTreeType])      => data.always ("Program"),
    ([sourceType])      => data.always ("script"),

    body                => array (Node.Statement),
    directives          => [array(Node.Directive), []],
    interpreter         => [nullable(Node.InterpreterDirective), null],
    sourceFile          => [nullable(string), null],

    ([varBindings])     =>  KeyPathsByName.compute (
                                take => `body.varBindingNames`),
    ([blockBindings])   =>  KeyPathsByName.compute (
                                take => `body.blockBindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `body.freeVariables`,
                                subtract => `varBindings`,
                                subtract => `blockBindings` ) );

exports.Module = Node `Module` (
    ([ESTreeType])      => data.always ("Program"),
    ([sourceType])      => data.always ("module"),

    body                => array (or (/*Node.ImportDeclaration,
                                      Node.ExportDeclaration,*/
                                      Node.Statement)),
    directives          => [array(Node.Directive), []],
    interpreter         => [nullable(Node.InterpreterDirective), null],
    sourceFile          => [nullable(string), null],

    ([varBindings])     =>  KeyPathsByName.compute (
                                take => `body.varBindingNames`),
    ([blockBindings])   =>  KeyPathsByName.compute (
                                take => `body.blockBindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `body.freeVariables`,
                                subtract => `varBindings`,
                                subtract => `blockBindings` ) );

exports.Program = union2 `Program` (
    is                  => Node.Module,
    or                  => Node.Script );
