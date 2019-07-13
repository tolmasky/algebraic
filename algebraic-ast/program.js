const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const { StringSet } = require("./string-set");
const compute = require("./compute");
const Extra = require("./extra");


exports.Directive = Node `Directive` (
    value               => Node.DirectiveLiteral );

exports.DirectiveLiteral = Node `DirectiveLiteral` (
    value               => string,
    extra               => [nullable(Extra(string)), null] );

exports.InterpreterDirective = Node `InterpreterDirective` (
    value               => string );

exports.Script = Node `Script` (
    ({override:type})   => "Program",
    ([sourceType])      => data.always ("script"),

    body                => array (Node.Statement),
    directives          => [array(Node.Directive), []],
    interpreter         => [nullable(Node.InterpreterDirective), null],
    sourceFile          => [nullable(string), null],

    ([varBindings])     =>  compute (StringSet,
                                take => `body.varBindingNames`),
    ([blockBindings])   =>  compute (StringSet,
                                take => `body.blockBindingNames`),
    ([freeVariables])   =>  compute (StringSet,
                                take => `body.freeVariables`,
                                subtract => `varBindings`,
                                subtract => `blockBindings` ) );

exports.Module = data `Module` (
    ({override:type})   => "Program",
    ([sourceType])      => data.always ("module"),

    body                => array (or (Node.ImportDeclaration,
                                      Node.ExportDeclaration,
                                      Node.Statement)),
    directives          => [array(Directive), []],
    interpreter         => [nullable(Node.InterpreterDirective), null],
    sourceFile          => [nullable(string), null],

    ([varBindings])     =>  compute (StringSet,
                                take => `body.varBindingNames`),
    ([blockBindings])   =>  compute (StringSet,
                                take => `body.blockBindingNames`),
    ([freeVariables])   =>  compute (StringSet,
                                take => `body.freeVariables`,
                                subtract => `varBindings`,
                                subtract => `blockBindings` ) );

exports.Program = union2 `Program` (
    is                  => Node.Module,
    or                  => Node.Script );
