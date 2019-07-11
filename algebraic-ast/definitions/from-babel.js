const Comment = require("./comment");
const { Position, SourceLocation } = require("./source-location");

const isNullOrUndefined =
    object => object === null || object === void(0);
const mapNullable = map => object =>
    isNullOrUndefined(object) ? null : map(object);
const mapSourceLocation = mapNullable(({ start, end }) =>
    SourceLocation({ start: Position(start), end: Position(end) }));
const mapComment = ({ type, loc, ...rest }) =>
    (type === "CommentBlock" ? Comment.Block : Comment.Line)
        ({ ...rest, loc: mapSourceLocation(loc) });
const mapArrayOf = map => array => array.map(map);
const mapComments = mapNullable(mapArrayOf(mapComment));
const mapCommonNodeFields = node =>
({
    leadingComments: mapComments(node.leadingComments),
    innerComments: mapComments(node.innerComments),
    trailingComments: mapComments(node.trailingComments),
    start: node.start,
    end: node.end,
    loc: mapSourceLocation(node.loc),
    extra: null
});

const Node = require("./node");

const toMapNode = function (mappings)
{
    const { VISITOR_KEYS } = require("@babel/types");

    VISITOR_KEYS["Program"].push("interpreter");

    const undeprecated = require("../babel/undeprecated-types");
    const mapVisitorFields = (fields, node) => Object
        .fromEntries(fields.map(field =>
            [field, mapNullableNode(node[field])]));
    const toMapNodeFields = (name, fields) => node =>
        ({  ...node,
            ...mapVisitorFields(fields, node),
            ...mapCommonNodeFields(node) });
    const nodeFieldMaps = Object.fromEntries(
        undeprecated.map(name =>
            [name, toMapNodeFields(name, VISITOR_KEYS[name])]));
    const mapNode = node => Array.isArray(node) ?
        node.map(mapNode) :
        ((name, fields) =>
            (mappings[name] ?
                mappings[name](fields, node) :
                Node[(console.log(name),name)](fields)))
            (node.type, nodeFieldMaps[node.type](node));
    const mapNullableNode = mapNullable(mapNode);

    return mapNode;
}
const mapNode = (function ()
{
    const { is, string } = require("@algebraic/type");

    const toObjectPropertyKey = ({ computed, key }) =>
        computed ? Node.ComputedPropertyName({ expression: key }) :
        is (Node.IdentifierExpression, key) ? Node.PropertyName(key) :
        key;
    const toObjectPropertyPattern = ({ shorthand, value, ...rest }) =>
        !shorthand ?
            Node.ObjectPropertyPatternLonghand({ ...rest,
                key: toObjectPropertyKey(rest),
                value: toPattern(value) }) :
            Node.ObjectPropertyPatternShorthand({ ...rest,
                value: is (Node.AssignmentPattern, value) ?
                    Node.ShorthandAssignmentPattern(value) :
                    toPattern(value) });
    const toPattern = pattern =>
//        is(Node.Identifier, pattern) ||
        is(Node.IdentifierExpression, pattern) ?
            Node.IdentifierPattern(pattern) :
        is(Node.ObjectProperty, pattern) ?
            toObjectPropertyPattern(pattern) :
            pattern;

    const mapToPatterns = (key, fields) => (patterns =>
    ({
        ...fields,
        [key]: fields[key].map(toPattern)
    }))();
    const Assignment = type =>
        ({ left, ...mappedFields }) =>
            type({ left: toPattern(left), ...mappedFields });
    const toPatternFields = (keys, type) => mappedFields =>
        type({ ...mappedFields, ...Object.fromEntries(keys
            .map(key => [key, mappedFields[key]])
            .map(([key, value]) => [key,
                Array.isArray(value) ?
                    value.map(toPattern) : toPattern(value)])) });

    return toMapNode(
    {
        Program: ({ sourceType, ...mappedFields }) =>
            sourceType === "module" ?
                Node.Module(mappedFields) :
                Node.Script(mappedFields),

        AssignmentExpression: Assignment(Node.AssignmentExpression, false),

        MemberExpression: (mappedFields, { computed, property }) =>
            Node.MemberExpression(computed ?
                mappedFields : { ...mappedFields, property }),

        CatchClause: toPatternFields(["param"], Node.CatchClause),
        VariableDeclarator: toPatternFields(["id"], Node.VariableDeclarator),

        ArrowFunctionExpression: toPatternFields(["params"],
            Node.ArrowFunctionExpression),

        FunctionExpression: toPatternFields(["id", "params"],
            Node.FunctionExpression),

        FunctionDeclaration: toPatternFields(["id", "params"],
            Node.FunctionDeclaration),

        Identifier: Node.IdentifierExpression,

        AssignmentPattern: Assignment(Node.AssignmentPattern, true),

        ArrayPattern: mappedFields =>
            Node.ArrayPattern(mapToPatterns("elements", mappedFields)),

        LabeledStatement: ({ label, ...mappedFields }) =>
            Node.LabeledStatement({ ...mappedFields, label: Node.Label(label) }),

        // ObjectPropertyPatterns are tricky. We can discover them here in the
        // actual property conversion phase since if they own a pattern, they
        // definitely can't resolve to an ObjectProperty.
        ObjectProperty: mappedFields =>
            is(Node.RootPattern, mappedFields.value) ||
            is(Node.AssignmentPattern, mappedFields.value) ?
                toObjectPropertyPattern(mappedFields) :
            (({ computed, shorthand, ...rest }) =>
                shorthand ? Node.ObjectPropertyShorthand(mappedFields) :
                Node.ObjectPropertyLonghand({ ...mappedFields,
                    key: toObjectPropertyKey(mappedFields) }))
            (mappedFields),

        MemberExpression: ({ computed, property, ...mappedFields }) =>
            computed ?
                Node.ComputedMemberExpression({ ...mappedFields, property }) :
                Node.StaticMemberExpression(
                    { ...mappedFields, property: Node.PropertyName(property) }),

        // Or we could discover them later on here, if the ObjectPattern looked
        // syntactically equivalent to an ObjectExpression thus far (e.g. {x}).
        // At this point we will be sure that this is an ObjectPattern, and thus
        // it's children must be ObjectPropertyPatterns.
        ObjectPattern: mappedFields =>
            Node.ObjectPattern(mapToPatterns("properties", mappedFields)),

        RestElement: ({ argument, ...mappedFields }) =>
            Node.RestElement({ ...mappedFields, argument: toPattern(argument) }),

        TemplateElement: ({ value, ...mappedFields }) =>
            Node.TemplateElement({ ...mappedFields,
                value: Node.TemplateElement.Value(value) }),

        VariableDeclaration: ({ kind, declarations: declarators, ...mappedFields }) =>
            kind === "var" ?
                Node.VarVariableDeclaration({ declarators, ...mappedFields }) :
                Node.BlockVariableDeclaration({ kind, declarators, ...mappedFields })
    });
})();


module.exports = function map(node)
{
    return mapNode(node);
}

/*

const Node = require("./node");
const { NODE_FIELDS } = require("@babel/types");
const undeprecated = require("./babel/undeprecated-types");


const trivialMappings = Object
    .key(undeprecated)
    .map(name => [name, ]


function trivial(name)
{
    const fields = NODE_FIELDS[name];
    const type = Node[name];

    return function (babelNode)
    {
        const entries = fields
            .map(field => [field, fromBabel(babelNode[field])]);

        return type({ ...babelNode, });
        babelNode
        NODE_FIELDS
        t[name]
    }
}

const fromJS = (type, object) =>
    type((fields => Object.fromEntries(Object
        .keys(object)
        .map(key => [key, fields[key]])
        .map(([key, type]) => !type || is(primitive, type) ?
            object[key] : fromJS(type, object[key]))))
        (Object.fromEntries(data.fields(type))));

    
    
    .map()



function mapCommonFields(node) =>
({
    leadingComments: (node || []).map(comment => Comment)
})
{
    return {
        

        leadingComments => [nullable(Array), null],
        innerComments   => [nullable(Array), null],
        trailingComment => [nullable(Array), null],
        start           => [nullable(number), null],
        end             => [nullable(number), null],
        loc             => [nullable(SourceLocation), null]
}

module.exports = function fromBabel(node)
{
    return node;
}


/*
const fromJS = (type, object) =>
    type((fields => Object.fromEntries(Object
        .keys(object)
        .map(key => [key, fields[key]])
        .map(([key, type]) => [key,
            !type || typeof object[key] !== "object" ?
                object[key] : fromJS(type, object[key])])))
    (Object.fromEntries(data.fields(type))));
*/
