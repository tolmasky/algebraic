const fromEntries = require("@climb/from-entries");

const Comment = require("./comment");
const { Position, SourceLocation } = require("./source-location");
const { is } = require("@algebraic/type");
const fail = require("@algebraic/type/fail");

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
    start: node.start || null,
    end: node.end || null,
    loc: mapSourceLocation(node.loc)
});

const toSourceData = node => Node.SourceData(mapCommonNodeFields(node));

const Node = require("./node");

const toMapNode = function (mappings)
{
    const t = require("@babel/types");

//    t.VISITOR_KEYS["Program"].push("interpreter");
//    t.VISITOR_KEYS["BranchExpression"] = ["argument"];
//    t.VISITOR_KEYS["DerviceCallAndBranchExpression"] = ["callee", "arguments"];
    t.VISITOR_KEYS["IntrinsicReference"] = [];

    // DEPRECATED_KEYS is an unfortunate named map that actually contains
    // DEPRECATED_TYPES.
    const undeprecated = t.TYPES
        .filter(name => t[name] && !t.DEPRECATED_KEYS[name])
        .concat(["IntrinsicReference"]);
//        .concat(["BranchExpression", "DeriveCallAndBranchExpression"]);
    const mapVisitorFields = (fields, node) =>
        fromEntries(fields.map(field =>
            [field, mapNullableNode(node[field])]));
    const toMapNodeFields = (name, fields) => node =>
        ({  ...node,
            ...mapVisitorFields(fields, node),
            ...mapCommonNodeFields(node) });
    const nodeFieldMaps = fromEntries(
        undeprecated.map(name =>
            [name, toMapNodeFields(name, t.VISITOR_KEYS[name])]));
    const mapNode = node =>
        !node ? node :
        Array.isArray(node) ? node.map(mapNode) :
        is (Node, node) ? node :
        ((name, fields) =>
            (mappings[name] ?
                mappings[name](fields, node) :
                Node[name](fields)))
            (node.type, nodeFieldMaps[node.type](node));
    const mapNullableNode = mapNullable(mapNode);

    return mapNode;
}




const mapNode = (function ()
{
    const { is, data, string, number, getTypename } = require("@algebraic/type");
    const { parameterized: { parameters } } = require("@algebraic/type/parameterized");

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
    const toPatternFields = (keys, type) => mappedFields =>
        type({ ...mappedFields, ...fromEntries(keys
            .map(key => [key, mappedFields[key]])
            .map(([key, value]) => [key,
                Array.isArray(value) ?
                    value.map(toPattern) : toPattern(value)])) });

    const toBinding = pattern =>
        is (Node.IdentifierExpression, node) ?
            Node.BindingIdentifier(node) :
            pattern;

    return toMapNode(
    {
        Program: ({ sourceType, ...mappedFields }) =>
            sourceType === "module" ?
                Node.Module(mappedFields) :
                Node.Script(mappedFields),

        MemberExpression: (mappedFields, { computed, property }) =>
            Node.MemberExpression(computed ?
                mappedFields : { ...mappedFields, property }),

        CatchClause: toPatternFields(["param"], Node.CatchClause),

//        VariableDeclarator: toPatternFields(["id"], Node.VariableDeclarator),

        ArrowFunctionExpression: toPatternFields(["params"],
            Node.ArrowFunctionExpression),

        FunctionExpression: toPatternFields(["id", "params"],
            Node.FunctionExpression),

        FunctionDeclaration: toPatternFields(["id", "params"],
            Node.FunctionDeclaration),

        Identifier: Node.IdentifierExpression,

        AssignmentPattern: ({ left, ...mappedFields }) =>
            Node.AssignmentPattern({ left: toPattern(left), ...mappedFields }),

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

        VariableDeclaration: ({ kind, declarations }) =>
            ({
                var:    Node.VariableDeclaration,
                const:  Node.ConstLexicalDeclaration,
                let:    Node.LetLexicalDeclaration
            })[kind]({ bindings: declarations.map(toBinding) }),

        ...fromEntries([
            Node.BigIntLiteral,
            Node.NumericLiteral,
            Node.RegExpLiteral,
            Node.StringLiteral,
            Node.DirectiveLiteral]
                .map(type => [type,
                    parameters(parameters(data.fields(type)
                        .find(field => field.name === "extra"))[0])[0]])
                .map(([type, ExtraT]) => [getTypename(type),
                    ({ extra, ...mappedFields }) =>
                        type({ ...mappedFields, extra: extra ? ExtraT(extra) : null })])),

        Placeholder: ({ name, expectedNode }) =>
            expectedNode !== "Expression" ?
                fail(`Only PlaceholderExpressions are supported.`) :
                Node.PlaceholderExpression({ name: name.name })
    });
})();


const t = require("@babel/types");
const keys =
    (keys => node => keys[node.type])
    ({ ...t.VISITOR_KEYS, IntrinsicReference: [] });
const trivial = (node, map) => node && (console.log("ATTEMPTING TRIVIAL FOR ", node, node.type),Node[node.type])(map(node));

    const { data, string, number, type } = require("@algebraic/type");
    const { parameterized: { parameters } } = require("@algebraic/type/parameterized");



const fromBabel = require("./map-babel-node")(
    keys,
    (mappings => (node, map) => (mappings[node.type] || trivial)
        ({ ...node, sourceData: toSourceData(node) }, map))
({
    Identifier: node => Node.IdentifierExpression(node),

    MemberExpression: ({ computed, ...node }) => Node.MemberExpression(
    {
        ...node,
        property: !computed ?
            Node.IdentifierName(node.property) :
            fromBabel(node.property),
        object: fromBabel(node.object)
    }),

    VariableDeclaration: ({ kind, declarations }) =>
    ({
        var:    Node.VariableDeclaration,
        const:  Node.ConstLexicalDeclaration,
        let:    Node.LetLexicalDeclaration
    })[kind]({ bindings: declarations/*.map(toBinding)*/ }),

    FunctionDeclaration: node => Node.FunctionDeclaration
    ({
        ...node,
        ...toParameterBindings(node.params),
        id: toIdentifierBinding(node.id),
        body: fromBabel(node.body)
    }),

    ...fromEntries([
        Node.BigIntLiteral,
        Node.NumericLiteral,
        Node.RegExpLiteral,
        Node.StringLiteral,
        Node.DirectiveLiteral]
            .map(NodeT => [NodeT,
                parameters(parameters(data.fields(NodeT)
                    .find(field => field.name === "extra"))[0])[0]])
            .map(([NodeT, ExtraT]) => [
                type.name(NodeT),
                ({ extra, ...node }, map) => NodeT(
                {
                    ...map(node),
                    extra: extra ? ExtraT(extra) : null
                })]))
}));


const consts = Object.assign(
    f => f(),
    {
        defer: (f, initialized = false) =>
        (...args) =>
            (initialized || (initialized = f()))(...args)
    });

const toRestableArray = (function ()
{
    const defer = f => (...args) => f();
    const extract = f => [(f + "").match(/^[^\s=]+/g)[0], f()];
    const isRest = item =>
        item && (item.type + "").startsWith("Rest");
    const split = (array, { length } = array) =>
        array.length > 0 && isRest(array[length - 1])?
        [array.slice(0, -1), array[length - 1]] :
        [array, null];
    const toTailProperty = plural => plural
        .replace(/(?<!ie)s$/, "")
        .replace(/ies$/, "y")
        .replace(/^./, ch => `rest${ch.toUpperCase()}`);

    return description => consts.defer((
        [headProperty, [headConvert, tailConvert]] = extract(description),
        tailProperty = toTailProperty(headProperty)) =>
            array => consts
                (([head, tail] = split(array)) =>
                ({
                    [headProperty]: head.map(headConvert),
                    [tailProperty]: tail && tailConvert(tail)
                })));
})();

const toFormalParameters = ({ params }, { length } = params) =>
    (tailIsRestElement =>
    ({
        parameters:
            (tailIsRestElement ? params.slice(0, length - 1) : params)
                .map(toDefaultableBinding),
        restParameter : tailIsRestElement ?
            toRestElementBinding(tail) :
            null
    }))(length > 0 && params[length - 1].type === "RestElement");

const expect = (function ()
{
    const { TYPES } = require("@babel/types");
    const extensions = Object
        .fromEntries(TYPES
        .map(name => [name, function (f)
        {
            return expect(this.predicates.concat([[name, f]]));
        }]));
    const types = predicates => predicates
        .map(([type]) => JSON.stringify(type)).join(", ");

    const _ = node => ({ ...node, sourceData: toSourceData(node) });

    return Object.assign(predicates =>
        Object.assign((node, ...rest) =>
            node && (([, f]) => f(_(node), ...rest))
                (predicates.find(([type]) => type === node.type) ||
                fail (
                    `Expected node of type ${types(predicates)}, ` +
                    `but instead got ${node ? node.type : ">null<" }`)),
            { predicates },
            extensions),
        { predicates: [] },
        extensions);
})();

const from = expect;

from.or = (...froms) => from([].concat(...froms.map(from => from.predicates)));


/*
const toParameterBinding = expect
    .

const toPatternBinding = expect
    .
*/

//const toBindingRestElement = expect
//    .Identifier(({ argument }) => )


const toIdentifierBinding = from
    .Identifier(Node.IdentifierBinding);

const toArrayPatternBinding = consts((
    toElements = toRestableArray(elements =>
        [toArrayElementBinding, toRestElementBinding])) =>
    from.ArrayPattern(node => Node.ArrayPatternBinding
    ({ ...node, ...toElements(node.elements) })));

const toRestPropertyBinding = toIdentifierBinding;

const toObjectPatternBinding = consts((
    toProperties = toRestableArray(properties =>
        [toPropertyBinding, toRestPropertyBinding])) =>
    from.ObjectPattern(node => Node.ObjectPatternBinding
    ({ ...node, ...toProperties(node.properties) })));

const toBareBinding = from.or(
    toIdentifierBinding,
    toArrayPatternBinding,
    toObjectPatternBinding );

const toArrayElementBinding = node =>
    node ? toDefaultableBinding(node) : Node.Elision();

const toDefaultedBinding = from.AssignmentPattern(
    node => Node.DefaultedBinding
    ({
        ...node,
        binding: toBareBinding(node.left),
        fallback: fromBabel(node.right)
    }));

// Should this be necessary?... vs. just doing fromBabel...
const toLiteralPropertyNameValue = from
    .Identifier(Node.IdentifierName)
    .StringLiteral(fromBabel)
    .NumericLiteral(fromBabel);

const toPropertyName = (computed, key) => computed ?
    Node.ComputedPropertyName({ expression: key }) :
    Node.LiteralPropertyName({ value: toLiteralPropertyNameValue(key) });

const toPropertyBinding = from.ObjectProperty(node => Node.PropertyBinding
({
    ...node,
    key: toPropertyName(node.computed, node.key),
    binding: toDefaultableBinding(node.value)
}));

const toDefaultableBinding = from.or(toDefaultedBinding, toBareBinding);

const toRestElementBinding = toBareBinding;

const toParameterBindings =
    toRestableArray(parameters =>
        [toDefaultableBinding, toRestElementBinding]);


/*

const toIdentifierBinding = expect
({
    AssignmentExpression: (node, map) =>
        Node.InitializedIdentifierBinding(
        {
            id: Node.BindingIdentifier(node.left),
            initializer: Node.Expression(map(node.right))
        }),
    IdentifierExpression: node =>
        Node.UninitializedIdentifierBinding
            ({ id: Node.BindingIdentifier(node) })
})



    .IdentifierExpression(false)
    ._(initialized => )

const toIdentifierBinding = (node, map) => expect(
{
    AssignmentExpression: true,
    IdentifierExpression: false
}, initialized => initialized ?
    Node.InitializedIdentifierBinding(
    {
        id: Node.BindingIdentifier(node.left),
        initializer: Node.Expression(map(node.right))
    }) :
    Node.UninitializedIdentifierBinding(
    {
        id: Node.BindingIdentifier(node)
    }));

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
    const toPatternFields = (keys, type) => mappedFields =>
        type({ ...mappedFields, ...fromEntries(keys
            .map(key => [key, mappedFields[key]])
            .map(([key, value]) => [key,
                Array.isArray(value) ?
                    value.map(toPattern) : toPattern(value)])) });

    const toBinding = pattern =>
        is (Node.IdentifierExpression, node) ?
            Node.BindingIdentifier(node) :
            pattern;
*/
module.exports = fromBabel;


