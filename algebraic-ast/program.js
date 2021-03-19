const type = require("@algebraic/type");
const Node = require("./node");
const Extra = require("./extra");


exports.Directive = Node `Directive`
({
    value               :of =>  Node.DirectiveLiteral
});

exports.DirectiveLiteral = Node `DirectiveLiteral`
({
    value               :of =>  type.string,
    extra               :of =>  Extra(string) `?`
});

exports.InterpreterDirective = Node `InterpreterDirective`
({
    value               :of =>  type.string
});

exports.Script = Node `Script`
({
    // FIXME: needs "alway"s
    sourceType          :of =>  type.string `()=` ("script"),

    body                :of =>  type.array (Node.Statement),
    directives          :of =>  type.array(Node.Directive) `=` ([]),
    interpreter         :of =>  Node.InterpreterDirective `?`,
    sourceFile          :of =>  type.string `?`
});

exports.Module = Node `Module`
({
    sourceType          :of =>  type.string `()=` ("module"),

    body                :of =>  type.array (type.union (/*Node.ImportDeclaration,
                                    Node.ExportDeclaration,*/
                                    Node.Statement)),
    directives          :of =>  type.array(Node.Directive) `=` ([]),
    interpreter         :of =>  Node.InterpreterDirective `?`,
    sourceFile          :of =>  type.string `?`
});

exports.Program = type.union `Program` (
    of                  => Node.Module,
    of                  => Node.Script );
