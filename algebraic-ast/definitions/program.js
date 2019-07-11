const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const FreeVariables = require("./string-set").in `freeVariables`;
const Extra = require("./extra");


exports.Directive = data `Directive` (
    ([type])            => data.always ("Directive"),
    value               => Node.DirectiveLiteral );

exports.DirectiveLiteral = data `DirectiveLiteral` (
    ([type])            => data.always ("DirectiveLiteral"),
    value               => string );

exports.InterpreterDirective = data `InterpreterDirective` (
    value               => string );

exports.Script = data `Script` (
    ([type])            => data.always ("Program"),
    ([sourceType])      => data.always ("script"),

    body                => array (Node.Statement),
    directives          => [array(Node.Directive), []],
    interpreter         => [nullable(Node.InterpreterDirective), null],
    sourceFile          => [nullable(string), null],
    ([freeVariables])   => FreeVariables.from("body") );

exports.Module = data `Module` (
    ([type])            => data.always ("Program"),
    ([sourceType])      => data.always ("module"),

    body                => array (or (Node.ImportDeclaration,
                                      Node.ExportDeclaration,
                                      Node.Statement)),
    directives          => [array(Directive), []],
    interpreter         => [nullable(Node.InterpreterDirective), null],
    sourceFile          => [nullable(string), null],
    ([freeVariables])   => FreeVariables.from("body") );

exports.Program = union2 `Program` (
    is                  => Node.Module,
    or                  => Node.Script );
