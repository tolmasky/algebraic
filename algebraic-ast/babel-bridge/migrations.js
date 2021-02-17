const { fromEntries } = Object;
const { QuerySet: AAST, Query, toObject, mapping, casting } = require("./object-query");
const Node = require("../node");


const Babel = name =>
    Query.object({ type: name })
        [mapping] (({
        leadingComments,
        innerComments,
        trailingComments,
        start,
        end,
        loc
        }) => sourceData);

Object.assign(Babel, fromEntries(require("@babel/types")
    .TYPES
    .concat(["Intrinsic", "IntrinsicReference"])
    .map(name => [name, Babel(name)])));

AAST.SourceData//["nullable <SourceData>"]
//    = Query.object({})
    = Query.object
        [mapping] (loc      =>  location)

AAST.Module
    = Babel.Program({ sourceType: "module" });

AAST.Script
    = Babel.Program({ sourceType: "script" });


AAST.IdentifierName
    = Babel.Identifier;

AAST.IdentifierReference
    = Babel.Identifier;

AAST.RestElementBinding
    = Babel.RestElement;

AAST.IdentifierBinding
    = Babel.Identifier
    | Babel.VariableDeclarator({ init: null }).id

AAST.Elision
    = Query.null;

AAST.ArrayAssignmentTarget
    = Babel.ArrayPattern
        [mapping] (elements => restElement);

AAST.RestElementAssignmentTarget
    = Babel.RestElement;

AAST.ObjectAssignmentTarget
    = Babel.ObjectPattern
        [mapping] (properties  => restProperty);

AAST.RestPropertyAssignmentTarget
    = Babel.RestElement;


AAST.ComputedPropertyName
    = ({ expression: Node.Expression });

// Remember, on the way back it's shorthand
AAST.PropertyBinding
    = Babel.ObjectProperty ({ computed: true })
        [casting] (key          =>  Node.ComputedPropertyName)
        [mapping] (shorthand    =>  prefersShorthand)
        [mapping] (value        =>  binding)
    | Babel.ObjectProperty ({ computed: false })
        [casting] (key          =>  Node.PropertyName)
        [mapping] (shorthand    =>  prefersShorthand)
        [mapping] (value        =>  binding);

AAST.PropertyAssignmentTarget
    = Babel.ObjectProperty ({ computed: true })
        [casting] (key          =>  Node.ComputedPropertyName)
        [mapping] (shorthand    =>  prefersShorthand)
        [mapping] (value        =>  binding)
    | Babel.ObjectProperty ({ computed: false })
        [casting] (key          =>  Node.PropertyName)
        [mapping] (shorthand    =>  prefersShorthand)
        [mapping] (value        =>  binding);

AAST.ObjectProperty
    = Babel.ObjectProperty ({ computed: true })
        [casting] (key          =>  Node.ComputedPropertyName)
        [mapping] (shorthand    =>  prefersShorthand)
        [mapping] (value        =>  binding)
    | Babel.ObjectProperty ({ computed: false })
        [casting] (key          =>  Node.PropertyName)
        [mapping] (shorthand    =>  prefersShorthand)
        [mapping] (value        =>  binding);


AAST.DefaultedAssignmentTarget
    = Babel.AssignmentPattern
        [mapping] (left         =>  target)
        [mapping] (right        =>  fallback);

AAST.ArrayPatternBinding
    = Babel.ArrayPattern
        [mapping] (elements     =>  restElement);

AAST.ObjectPatternBinding
    = Babel.ObjectPattern
        [mapping] (properties   =>  restProperty);

AAST.RestPropertyBinding
    = Babel.RestElement;

AAST.MemberExpression
    = Babel.MemberExpression({ computed: true })
        [casting] (property     =>  Node.Expression)
    | Babel.MemberExpression({ computed: false })
        [casting] (property     =>  Node.IdentifierName)

AAST.Label
    = Babel.RestElement;
    
Node["TemplateElement.Value"]
    = Babel.RestElement;

AAST.DefaultedBinding
    = Babel.VariableDeclarator
        [mapping] (id           =>  binding)
        [mapping] (init         =>  fallback)
    | Babel.AssignmentPattern
        [mapping] (left         =>  binding)
        [mapping] (right        =>  fallback);


AAST.ArrowFunctionExpression
    = Babel.ArrowFunctionExpression
        [mapping] (params       =>  parameters)
        [mapping] (params       =>  restParameter);

AAST.FunctionExpression
    = Babel.FunctionExpression
        [mapping] (params       =>  parameters)
        [mapping] (params       =>  restParameter);
        
AAST.FunctionDeclaration
    = Babel.FunctionDeclaration
        [mapping] (params       =>  parameters)
        [mapping] (params       =>  restParameter);

AAST.VariableDeclaration
    = Babel.VariableDeclaration({ kind: "var" })
        [mapping] (declarations =>  bindings);

AAST.LetLexicalDeclaration
    = Babel.VariableDeclaration({ kind: "let" })
        [mapping] (declarations =>  bindings);

AAST.ConstLexicalDeclaration
    = Babel.VariableDeclaration({ kind: "const" })
        [mapping] (declarations =>  bindings);

module.exports = { ...AAST, toDefaultTranslation:
    type => Babel[type] ? toObject(Babel[type]) : toObject(Query.object({})) };
