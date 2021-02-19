const { TYPES } = require("@babel/types")
const { Set, JS, setting, casting,toObject } = require("./value-translation");
const Node = require("../node");
const AST = Set();

AST.SourceLocation =
    JS.object
        [setting] (start            =>  ({ ...loc.start, index: start }))
        [setting] (end              =>  ({ ...loc.end, index: end }));

AST.Comments
    = JS.object
        [setting] (leading          =>  leadingComments)
        [setting] (inner            =>  innerComments)
        [setting] (trailing         =>  trailingComments);

const BabelNode
    = JS.object
        [setting](location          =>  ({ loc, start, end }))
        [setting](comments          =>  ({  leadingComments,
                                            innerComments,
                                            trailingComments }));

const Babel = Object.fromEntries(TYPES
    .concat("CommentLine", "CommentBlock", "IntrinsicReference")
    .map(type => [type, BabelNode({ type })]));

AST.MultiLineComment
    = Babel.CommentBlock;

AST.SingleLineComment
    = Babel.CommentLine;

AST.Module
    = Babel.Program({ sourceType: "module" });

AST.Script
    = Babel.Program({ sourceType: "script" });

AST.IdentifierName
    = Babel.Identifier;

AST.IdentifierReference
    = Babel.Identifier;

AST.RestElementBinding
    = Babel.RestElement;

AST.IdentifierBinding
    = Babel.Identifier
    | Babel.VariableDeclarator({ init: null }).id;

AST.Elision
    = JS.null;

AST.ArrayAssignmentTarget
    = Babel.ArrayPattern
        [setting] (restElement      =>  elements);

AST.RestElementAssignmentTarget
    = Babel.RestElement;

AST.ObjectAssignmentTarget
    = Babel.ObjectPattern
        [setting] (restProperty     =>  properties);

AST.RestPropertyAssignmentTarget
    = Babel.RestElement;

AST.ComputedPropertyName
    = ({ expression: Node.Expression });

// Remember, on the way back it's shorthand
AST.PropertyBinding
    = Babel.ObjectProperty ({ computed: true })
        [casting] (key              =>  Node.ComputedPropertyName)
        [setting] (prefersShorthand =>  shorthand)
        [setting] (binding          =>  value)
    | (Babel.ObjectProperty ({ computed: false })
        [casting] (key              =>  Node.PropertyName)
        [setting] (prefersShorthand =>  shorthand)
        [setting] (binding          =>  value))

AST.PropertyAssignmentTarget
    = Babel.ObjectProperty ({ computed: true })
        [casting] (key              =>  Node.ComputedPropertyName)
        [setting] (prefersShorthand =>  shorthand)
        [setting] (binding          =>  value)
    | Babel.ObjectProperty ({ computed: false })
        [casting] (key              =>  Node.PropertyName)
        [setting] (prefersShorthand =>  shorthand)
        [setting] (binding          =>  value)

AST.ObjectProperty
    = Babel.ObjectProperty ({ computed: true })
        [casting] (key              =>  Node.ComputedPropertyName)
        [setting] (prefersShorthand =>  shorthand)
        [setting] (binding          =>  value)
    | Babel.ObjectProperty ({ computed: false })
        [casting] (key              =>  Node.PropertyName)
        [setting] (prefersShorthand =>  shorthand)
        [setting] (binding          =>  value)

AST.DefaultedAssignmentTarget
    = Babel.AssignmentPattern
        [setting] (target           =>  left)
        [setting] (fallback         =>  right);

AST.ArrayPatternBinding
    = Babel.ArrayPattern
        [setting] (restElement      =>  elements);

AST.ObjectPatternBinding
    = Babel.ObjectPattern
        [setting] (restProperty     =>  properties);

AST.RestPropertyBinding
    = Babel.RestElement;

AST.MemberExpression
    = Babel.MemberExpression({ computed: true })
        [casting] (property         =>  Node.Expression)
    | Babel.MemberExpression({ computed: false })
        [casting] (property         =>  Node.IdentifierName)

AST.Label
    = Babel.Identifier;

AST.DefaultedBinding
    = Babel.VariableDeclarator
        [setting] (binding          =>  id)
        [setting] (fallback         =>  init)
    | Babel.AssignmentPattern
        [setting] (binding          =>  left)
        [setting] (fallback         =>  right);


AST.ArrowFunctionExpression
    = Babel.ArrowFunctionExpression
        [setting] (parameters       =>  params)
        [setting] (restParameter    =>  params);

AST.FunctionExpression
    = Babel.FunctionExpression
        [setting] (parameters       =>  params)
        [setting] (restParameter    =>  params);
        
AST.FunctionDeclaration
    = Babel.FunctionDeclaration
        [setting] (parameters       =>  params)
        [setting] (restParameter    =>  params);

AST.VariableDeclaration
    = Babel.VariableDeclaration({ kind: "var" })
        [setting] (bindings         => declarations);

AST.LetLexicalDeclaration
    = Babel.VariableDeclaration({ kind: "let" })
        [setting] (bindings         => declarations);

AST.ConstLexicalDeclaration
    = Babel.VariableDeclaration({ kind: "const" })
        [setting] (bindings         => declarations);

// toDefaultTranslation is not who should handle this!
module.exports = { ...AST, Babel,
    toDefaultTranslation: type => Babel[type] ? Babel[type].toObject : JS.object.toObject };
