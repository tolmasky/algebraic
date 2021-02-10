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

Node.IdentifierReference = Node.IdentifierExpression;

const fromBabel2 = require("./map-babel-node")(
    keys,
    (mappings => (node, map) => (mappings[node.type] || trivial)
        ({ ...node, sourceData: toSourceData(node) }, map))
({
    Identifier: node => Node.IdentifierExpression(node),

    AssignmentExpression: node => Node.AssignmentExpression
    ({
        ...node,
        left: toAssignmentTarget(node.left),
        right: fromBabel(node.right)
    }),

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


const given = Object.assign(
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

    return description => given.defer((
        [headProperty, [headConvert, tailConvert]] = extract(description),
        tailProperty = toTailProperty(headProperty)) =>
            array => given
                (([head, tail] = split(array)) =>
                ({
                    [headProperty]: head.map(headConvert),
                    [tailProperty]: tail && tailConvert(tail)
                })));
})();

const toKeyPath = path => !path || path.length <= 0 ?
    "" :
    `${path[1].length ? `${toKeyPath(path[1])}.` : ""}${path[0]}`;
const BabelTypeName = type => `[BabelNode ${type}]`;
const toExpectationString = expectation =>
    typeof expectation === "function" ?
        `type ${type.name(expectation)}` :
    expectation + "";

const failToMap = error => fail(error instanceof Error ?
    error :
    Object
        .assign(Object
        .defineProperty(Error(), "message",
        {
            get: () => (console.log(error),
                `Expected ${toExpectationString(error.expected)} at ` +
                `\`${toKeyPath(error.path)}\`, but found: ` +
                    (!error.value || typeof error.value !== "object" ?
                        error.value :
                    typeof error.value.type === "string" ?
                        BabelTypeName(error.value.type) :
                    JSON.stringify(error.value)))
        }),
        error));

const recover = f => ({ on(recover)
{
    try { return f() }
    catch(error) { return recover(error) }
} });

const maps = (function ()
{
    const given = f => f();
    const { type, data, parameterized, tnull, array, nullable } = require("@algebraic/type");
    const union = require("@algebraic/type/union-new");
    const { fromEntries } = Object;
    const Extra = require("./extra");

    const FieldKeyMappings =
    {
        FunctionDeclaration:
        {
            parameters: "params",
            restParameter: "params"
        },

        ArrayPatternBinding:
        {
            restElement: "elements"
        },

        ObjectPatternBinding:
        {
            restProperty: "properties"
        },

        ArrayAssignmentTarget:
        {
            restElement: "elements"
        },

        ObjectAssignmentTarget:
        {
            restProperty: "properties"
        }
    };

    const mapNull = (maps, path, value) =>
        value === null ? null : failToMap({ path, expected: tnull, value });

    const toMapExtra = ExtraT => given((
        ValueT = parameters(ExtraT)[0]) =>
    [
        [],
        (maps, path, value) => ExtraT(value)
    ]);

    const toMapNodeFields = fields =>
        (maps, path, value) =>
        ({
            ...value,
            sourceData: toSourceData(value),
            ...fromEntries(fields
                .map(([toKey, fromKey, typename]) =>
                [
                    toKey,
                    maps[typename](
                        maps,
                        [fromKey, path],
                        value[fromKey])
                ]))
        });

    const toMapNode = NodeT => given((
        typename = type.name(NodeT),
        fields = findMappableFields(NodeT),
        mapNodeFields = toMapNodeFields(fields)) =>
        [
            fields.map(([, , , T]) => T),
            Object.assign((maps, path, value) =>
                !value || value.type !== typename ?
                    failToMap({ path, expected: NodeT, value }) :
                    NodeT(mapNodeFields(maps, path, value)),
            { fields: mapNodeFields })
        ]);

    const toMapUnion = UnionT => given((
        Ts = union.components(UnionT),
        typenames = Ts.map(T => type.name(T)),
        count = Ts.length) =>
        [
            Ts,
            (maps, path, value) =>
                typenames.reduce((mapped, typename, index) =>
                    mapped ||
                    recover(() => maps[typename](maps, path, value))
                        .on(error => error.path === path ?
                            (console.log(toKeyPath(path) + " failed for " + error.expected),false) :
                            (console.log(error),console.log(toKeyPath(path), "vs.", toKeyPath(error.path)), failToMap(error))),
                    false) || failToMap({ expected: UnionT, path, value })
        ]);

    const isRestValue = item =>
        item &&
        item.type &&
        item.type.startsWith("Rest");
    const toMapArray = ArrayT => given((
        ItemT = parameterized.parameters(ArrayT)[0],
        ItemTypename = type.name(ItemT)) =>
        [
            [ItemT],
            (maps, path, value) =>
                !Array.isArray(value) ?
                    failToMap({ expected: ArrayT, path, value }) :
                    (isRestValue(value[value.length - 1]) ?
                        value.slice(0, -1) :
                        value).map((item, index) =>
                            maps[ItemTypename](maps, [index, path], item))
        ]);

    const toMapNullableRest = NullableT => given((
        RestT = parameters(NullableT)[0],
        RestTypename = type.name(RestT)) =>
        [
            [RestT],
            (maps, path, values) => given((
                index = values.length - 1,
                last = values[index]) =>
                isRestValue(last) ?
                    maps[RestTypename](maps, [index, path], last) :
                    null)
        ]);

    const toMapType = T =>
        T === tnull ? [[], mapNull] :
        (parameterized.is(array, T) ? toMapArray :
        parameterized.is(Node, T) ? toMapNode :
        parameterized.is(Extra, T) ? toMapExtra :
        isNullableRest(T) ? toMapNullableRest :
        type.kind(T) === union ? toMapUnion :
        (console.error("wasn't expecting " + T), T => []))(T);

    const toMapEntries = (Ts, visited = Ts) =>
        Ts.size <= 0 ? [] : given((
        results = Array.from(Ts, T => [type.name(T), toMapType(T)]),
        discovered = new Set(results
            .flatMap(([, [Ts]]) => Ts)
            .filter(T => !visited.has(T)))) =>
            results
                .flatMap(([name, [, map]]) => Object
                    .entries(map)
                    .map(([key, map]) => [`${name}.${key}`, map])
                    .concat([[name, map]]))
                .concat(toMapEntries(
                    (console.log("DISCOVERED:",discovered),discovered),
                    Array
                        .from(discovered)
                        .reduce((visited, T) => visited.add(T), visited))));

    const findMappableFields = NodeT => data
        .fields(NodeT)
        .filter(field =>
            is (data.field.definition.supplied, field.definition))
        .map(field => [field.name, parameters(field)[0]])
        .filter(([name, T]) =>
            !name.endsWith("Comments") && isNodeOrComposite(T))
        .map(([name, T]) =>
        [
            name,
            (FieldKeyMappings[type.name(NodeT)] || {})[name] || name,
            type.name(T),
            T
        ]);

    const isNullableRest = T =>
        parameterized.is(nullable, T) &&
        type.name(parameters(T)[0]).startsWith("Rest");

    const isNodeOrComposite = T =>
        parameterized.is(array, T) ||
        parameterized.is(Node, T) ||
        parameterized.is(Extra, T) ||
        type.kind(T) === union &&
            union.components(T).some(isNodeOrComposite);
    console.log(Node);
    const RootTypes = new Set(Object
        .values(Node)
        .filter(isNodeOrComposite));

    const maps = fromEntries(toMapEntries(RootTypes));

    console.log("oki", maps);
//    console.log(JSON.stringify(Object.keys(maps), null, 2));
//    console.log(union.components(Node.Binding).map(type.name) + "");

    return maps;
/*
            visited.add())
        newMaps = fromEntries(results.map(([name, [, map]]) => [name, map])) }),

        callagain(new Set(results.flatMap(([, [Ts]]) => Ts)).remove(), newMaps)



    function (maps, T)
    {

    }

        results = Ts.map(T => [type.name(T), toMapType(T)],
        newMaps = { ...maps, ...fromEntries(results.map(([name, [, map]]) => [name, map])) }),

        callagain(new Set(results.flatMap(([, [Ts]]) => Ts)).remove(), newMaps)


        remaining = new Set(results.flatMap(([, [Ts]]) => Ts)),


         reduce(maps, assign(maps, fromEntries(pairs)))

    .reduce()
            .reduce(([remaining, maps], T) => given((
                typename = type.name(T),
                [Ts, map] = toMapType(T)) =>
                [
                    Ts,
                    Object.assign(maps, { [type.name(T)]: map })
                ], [[], maps])

            } [type.name(T), toMapType(T)])
            .assign(
                converters,
                { [type.name(T)]: toAlgebraic(converters, T) }),
            { });



        convertT = (node, index) => index >= count ?
            [false, type.name(T)] :
            given((
                [succeeded, result] = converters[index](node)) =>
                succeeded ?
                    [succeeded, result] :
                    convertT(node, index + 1))) =>
                        node => convertT(node, 0));




                // Make sure to properly convert back...
                given((converted = node.map(convertItemT)) =>
                    converted.find(([succeeded]) => !succeeded) ?
                        [false, type.name(T)] :
                        [true, converted.map(([, value]) => value)]));


                    fields = findMappableFields(NodeT) =>
        (maps, node) => given((
            [result, mapped] = mapAccum(
                (result, [key, typename]) => result === true ? given((
                    [result, value] = maps[typename](node[key])) =>
                        result === true ?
                            [result, value] :
                            [[false, { type: NodeT, { key, value } }], false])
                        [result, false],
                true,
                fields) =>
                result === true ?
                    [true, fromEntries(mapped)] :
                    result)

                [false, { type: NodeT, found: node }] :
                given((
                    sourceData = toSourceData(node),
                    [result, children] = mapNodeChildren(maps, node)) =>
                    result === false ?
                        result :
                        NodeT({ sourceData, ...children })));

    const toMapNode = NodeT => given((
        typename = type.name(NodeT),
        mapNodeChildren = toMapNodeChildren(NodeT)) =>
        (maps, node) =>
            !node || node.type !== typename ?
                [false, { type: NodeT, found: node }] :
                given((
                    sourceData = toSourceData(node),
                    [result, children] = mapNodeChildren(maps, node)) =>
                    result === false ?
                        result :
                        NodeT({ sourceData, ...children })));

    const toMapNodeChildren = NodeT => given((
        fields = findMappableFields(NodeT) =>
        (maps, node) => given((
            [result, mapped] = mapAccum(
                (result, [key, typename]) => result === true ? given((
                    [result, value] = maps[typename](node[key])) =>
                        result === true ?
                            [result, value] :
                            [[false, { type: NodeT, { key, value } }], false])
                        [result, false],
                true,
                fields) =>
                result === true ?
                    [true, fromEntries(mapped)] :
                    result)

    const fromArray = T => given((
        ItemT = parameterized.parameters(T)[0],
        convertItemT = convert(ItemT)) =>
            node =>
                !Array.isArray(node) ? [false, type.name(T)] :
                // Make sure to properly convert back...
                given((converted = node.map(convertItemT)) =>
                    converted.find(([succeeded]) => !succeeded) ?
                        [false, type.name(T)] :
                        [true, converted.map(([, value]) => value)]));

    OrError(
        e => [],

Either A B

Left A
Left B


    const toValueMigration = T =>
        T === tnull ? toNullMigration :
        (parameterized.is(array, T) ? toArrayMigration :
        parameterized.is(Node, T) ? toNodeMigration :
        type.kind(T) === union ? toUnionMigration :
        (console.error("wasn't expecting " + T), T => []))(T);

        converters[type.name(T)](node)

[key] -> [p] -> [key]


    const convert = (converters, T) =>
        defaults[type.name(T)] ||
        (   T === tnull ? fromNull :
            parameterized.is(array, T) ? fromArray :
            parameterized.is(Node, T) ? fromNode :
            type.kind(T) === union ? fromUnion :
            (console.error("wasn't expecting " + T), converters => converters))
            (converters;

    const toAlgebraic = convert;
    // Deal with union2.
    // Deal with array<X>.
    const isNodeOrComposite = T =>
        parameterized.is(array, T) ||
        parameterized.is(Node, T) ||
        type.kind(T) === union &&
            union.components(T).some(isNodeOrComposite);

    const custom = {};

    const AlgebraicTypes = Object.values(Node);
console.log(AlgebraicTypes)
    const fieldConverters = fromEntries(Object
        .values(Node)
        .filter(T => parameterized.is(Node, T))
        .map(T => [type.name(T), data.fields(T)
            .filter(field =>
                is (data.field.definition.supplied, field.definition))
            .map(field => [field.name, parameters(field)[0]])
            .filter(([name, T]) =>
                !name.endsWith("Comments") && isNodeOrComposite(T))
            .map(([name, T]) => [name, convert(T)])]));

//    return node => fromBabel(custom)

    return AlgebraicTypes
        .reduce((converters, T) => Object
            .assign(
                converters,
                { [type.name(T)]: toAlgebraic(converters, T) }),
            { });
    */
})();

/*
to().from
    .Identifier()
    .Expression()
    .Blah(...)

to `Whatever`
.from(x => y)
.from(t => z)



const toAlgebraic(
{
});

/*


    return

    const fromCustom = predicates =>


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

    console.log(fieldConverters);

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
})(from =>
{
    FunctionDeclaration: from.FunctionDeclaration(
    {
            node => Node.FunctionDeclaration
            ({
                ...node,
                ...toParameterBindings(node.params),
                id: toIdentifierBinding(node.id),
                body: fromBabel(node.body)
            })
        })
);
*/

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
console.log(from);
const toIdentifierBinding = from
    .Identifier(Node.IdentifierBinding);

const toArrayPatternBinding = given((
    toElements = toRestableArray(elements =>
        [toArrayElementBinding, toRestElementBinding])) =>
    from.ArrayPattern(node => Node.ArrayPatternBinding
    ({ ...node, ...toElements(node.elements) })));

const toRestPropertyBinding = toIdentifierBinding;

const toObjectPatternBinding = given((
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
/*const toLiteralPropertyNameValue = from
    .Identifier(Node.IdentifierName)
    .StringLiteral(fromBabel)
    .NumericLiteral(fromBabel);
*/
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


const OrderedChoice = (expected, choices) =>
    (maps, path, value) =>
        choices.reduce((mapped, choice, index) =>
            mapped ||
            recover(() => choice(maps, path, value))
                .on(error => error.path === path ?
                    false :
                    failToMap(error)),
            false) ||
            failToMap({ expected, path, value });





/*
const toOneKeyObject = (key, value) => ({ [key]: value });
const toChainedObject = (key, value) => ({ [key]: value })

{ from: from(precedent, AlgebraicTN)

const from: _(precedent, AlgebraicTN) =>
    new Proxy({}, { get: (_, BabelTN) =>
        toBabelMatch(precedent, AlgebraicTN, BabelTN) })

const toBabelMatch = (precedent, AlgebraicTN, BabelTN) =>
    given((
        NodeT = Node[AlgebraicTN],
        MapFieldKey = `${AlgebraicTN}.fields`,
        toBabelMatchObject = (...rest) => toOneKeyObject(
            AlgebraicTN,
            toOrderedChoice(predent,
                toBabelMatchMap(NodeT, BabelTN, ...rest))) =>
    Object.assign((...args) =>
        toBabelMatchObject(
            args.length > 1 && entries(args[0]), args[1])),
        toBabelMatchObject(false, maps[MapFieldKey])));
*/

const { array } = require("@algebraic/type");

const toOrderedChoice = (precedent, map) =>
    (maps, path, value) =>
        recover(() =>
            precedent && precedent(maps, path, value))
            .on(error => error.path === path ?
                false :
                failToMap(error)) ||
        map(maps, path, value);

const toBabelMatchMap = given((
    BabelMatch = (type, entries) =>
        (console.log("here...", type, entries),({ toString: !entries ?
        () => { console.log("one"); return `[BabelNode ${type}]` } :
        () => { console.log("two"); return `[BabelNode ${type}, where ${entries
            .map(([key, value]) => `${key} = ${value}`)
            .join(", ")}]` }
    }))) =>
    (NodeT, type, entries, mapFields) => type === "null" ?
        (maps, path, value) =>
            value === null ?
                NodeT() :
                failToMap({ expected: null, path, value }) :
        (maps, path, value) =>
            !value || value.type !== type ||
            entries && entries
                .some(([key, expected]) => value[key] !== expected) ?
            failToMap({ expected: BabelMatch(type, entries), path, value }) :
            NodeT(mapFields(maps, path, value)));

const toBabelMatchFrom = (precedent, AlgebraicTN) =>
    new Proxy({}, { get: (_, BabelTN) =>
        toBabelMatch(precedent, AlgebraicTN, BabelTN) });
const toBabelMatch = (precedent, AlgebraicTN, BabelTN) =>
    given((
        NodeT = Node[AlgebraicTN],
        MapFieldKey = `${AlgebraicTN}.fields`,
        toBabelMatchObject = (...rest) => given((
            babelMatchMap = toOrderedChoice(
                precedent,
                toBabelMatchMap(NodeT, BabelTN, ...rest))) =>
    ({
        from: toBabelMatchFrom(babelMatchMap, AlgebraicTN),
        [AlgebraicTN]: babelMatchMap
    }))) =>
    Object.assign((...args) =>
        toBabelMatchObject(
            args.length > 1 && Object.entries(args[0]),
            args.length > 1 ? args[1] : args[0]),
        toBabelMatchObject(false, maps[MapFieldKey])));

const to = new Proxy(
    {},
    { get: (_, AlgebraicTN) =>
        ({ from: toBabelMatchFrom(false, AlgebraicTN) }) });
/*
const to = new Proxy({}, {
    get: (_, typename) =>
    ({ from: new Proxy({}, {
        get: (_, from) => given((
            NodeT = Node[typename],
            MapFieldKey = `${typename}.fields`) =>
            Object.assign((pattern, mapFields) =>
                ({  [typename]: match(
                        NodeT,
                        from,
                        Object.entries(pattern),
                        (maps, path, value) =>
                        ({
                            ...value,
                            sourceData: toSourceData(value),
                            ...mapFields(maps, path, value)
                        })) }),
                { [typename]: match(NodeT, from, false,
                    (maps, path, value) =>
                        maps[MapFieldKey](maps, path, value)) })) }) })
});
*/
const toArrayElementAssignmentTarget = node =>
    node ? toDefaultableAssignmentTarget(node) : Node.Elision();

const toArrayAssignmentTarget = given((
    toElements = toRestableArray(elements =>
        [toArrayElementAssignmentTarget, toRestElementAssignmentTarget])) =>
    from.ArrayPattern(node => Node.ArrayAssignmentTarget
    ({ ...node, ...toElements(node.elements) })));

// FIXME: fromExpression?
//const toRestPropertyAssignmentTarget = fromBabel;

const toObjectAssignmentTarget = given((
    toProperties = toRestableArray(properties =>
        [toPropertyAssignmentTarget, toRestPropertyAssignmentTarget])) =>
    from.ObjectPattern(node => Node.ObjectAssignmentTarget
    ({ ...node, ...toProperties(node.properties) })));

const toDefaultedAssignmentTarget = from.AssignmentPattern(
    node => Node.DefaultedAssignmentTarget
    ({
        ...node,
        target: toAssignmentTarget(node.left),
        fallback: fromBabel(node.right)
    }));



//const toRestElementAssignmentTarget = fromBabel;
/*
const toAssignmentTarget = from
    .Identifier(fromBabel)
    .MemberExpression(fromBabel)
    .ArrayPattern(toArrayAssignmentTarget)
    .ObjectPattern(toObjectAssignmentTarget)
const toDefaultableAssignmentTarget =
    from.or(toDefaultedAssignmentTarget, toAssignmentTarget);

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

const { or } = require("@algebraic/type");
//console.log(to.IdentifierExpression.from.Identifier.IdentifierExpression({},[], {}));

console.log(maps["PropertyName"]+"")
const fromBabel = given((
    customMaps = Object.assign({},
    maps,

    to.IdentifierName.from.Identifier,
    to.IdentifierExpression.from.Identifier,

    to.RestElementBinding.from.RestElement,

    to.IdentifierBinding
        .from.Identifier
        .from.VariableDeclarator(
            { init: null },
            (maps, path, value) => value.id),

    to.Elision.from.null,

    to.ArrayAssignmentTarget.from.ArrayPattern,
    to.RestElementAssignmentTarget.from.RestElement,

    to.ObjectAssignmentTarget.from.ObjectPattern,
    to.RestPropertyAssignmentTarget.from.RestElement,
    to.PropertyAssignmentTarget.from.ObjectProperty((maps, path, value) =>
    ({
        key: maps.PropertyName(maps, ["key", path], value.key),
        target:
            maps.DefaultableAssignmentTarget(maps, ["value", path], value.value)
    })),

    to.DefaultedAssignmentTarget
        .from.AssignmentPattern((maps, path, value) =>
        ({
            target: maps.AssignmentTarget(maps, ["left", path], value.left),
            fallback: maps.Expression(maps, ["right", path], value.right)
        })),

    to.ArrayPatternBinding.from.ArrayPattern,
    to.ObjectPatternBinding.from.ObjectPattern,
    to.RestPropertyBinding.from.RestElement,

    to.LonghandPropertyBinding.from.ObjectProperty(
        { shorthand: false },
        (maps, path, value) =>
        ({
            key: maps.PropertyName(maps, ["key", path], value.key),
            binding: maps.DefaultableBinding(maps, ["value", path], value.value)
        })),

    to.ShorthandPropertyBinding.from.ObjectProperty(
        { shorthand: true },
        (maps, path, value) =>
        ({
            key: maps.IdentifierName(maps, ["key", path], value.key),
            binding: maps.DefaultableBinding(maps, ["value", path], value.value)
        })),

    to.LonghandObjectProperty.from.ObjectProperty(
        { shorthand: false },
        (maps, path, value) =>
        ({
            key: maps.PropertyName(maps, ["key", path], value.key),
            value: maps.Expression(maps, ["value", path], value.value)
        })),

    to.ShorthandObjectProperty.from.ObjectProperty(
        { shorthand: true },
        (maps, path, value) =>
        ({
            value: maps.IdentifierExpression(maps, ["value", path], value.value)
        }) }),

    // Would be nice to have a "push down" operator, X => value: X
    given((ValueTN = type.name(
        or(
            Node.IdentifierName,
            Node.StringLiteral,
            Node.NumericLiteral))) =>
        ["Identifier", "StringLiteral", "NumericLiteral"]
            .reduce((to, BabelTN) => to
                .from[BabelTN]((maps, path, value) =>
                    ({ value: maps[ValueTN](maps, path, value) })),
                to.LiteralPropertyName)),

    to.DefaultedBinding
        .from.VariableDeclarator((maps, path, value) =>
        ({
            binding: maps.IdentifierBinding(maps, ["id", path], value.id),
            fallback: maps.Expression(maps, ["init", path], value.init)
        }))
        .from.AssignmentPattern((maps, path, value) =>
        ({
            binding: maps.IdentifierBinding(maps, ["left", path], value.left),
            fallback: maps.Expression(maps, ["right", path], value.right)
        })),

    ...[
        [Node.VariableDeclaration,
            "var", or (Node.IdentifierBinding, Node.DefaultedBinding)],
        [Node.LetLexicalDeclaration,
            "let", or (Node.IdentifierBinding, Node.DefaultedBinding)],
        [Node.ConstLexicalDeclaration,
            "const", Node.DefaultedBinding],
    ].map(([NodeT, kind, BindingT]) => given((
        ArrayBindingTN = type.name(array(BindingT))) =>
            to[type.name(NodeT)]
            .from.VariableDeclaration({ kind }, (maps, path, value) =>
            ({
                bindings: maps[ArrayBindingTN](
                    maps,
                    ["declarations", path],
                    value.declarations)
            })))))) => (T, value) => (console.log("ABOUT TO DO: " + JSON.stringify(T) + " " + type.name(T)),customMaps[type.name(T)](customMaps, [], value)));

//console.log("--->", to.IdentifierExpression.from.Identifier);
module.exports = (...args) =>
    args.length === 1 ?
        (console.error("BAD: " + args[0].type + " " + Node[args[0].type]), fromBabel(Node[args[0].type], args[0])) :
        fromBabel(...args);


/*

/*
    FunctionDeclaration: (maps, path, value) => Node.FunctionDeclaration
    ({
        ...value,
        ...toParameterBindings(value.params),
        id: fromBabel(Node.IdentifierBinding, value.id),
        body: fromBabel(Node.BlockStatement, value.body)
    }),


fromKind = kind =>
[
    { kind: "var" },
    (maps, path, value) => value
        .declarations
        .map((declaration, index) =>
            maps["DefaultedBinding"]
                (maps, declaration, [index, ["declarations", [path]]]))
]


/*
const nodeCheck = (maps, path, type, value) =>
    value && value.type === type ?
        failToMap({ expected: BabelTypeName(type), path, value }) :
        value;

const toVariableDeclaration = kind =>
    nodeCheck(node) &&
    node.kind === kind

    []

    node => !node || node.type

        VariableDeclaration: ({ kind, declarations }) =>
            ({
                var:    Node.VariableDeclaration,
                const:  Node.ConstLexicalDeclaration,
                let:    Node.LetLexicalDeclaration
            })[kind]({ bindings: declarations.map(toBinding) }),

/*
fromBabel = node => (console.log(node),maps[node.type](
{
    ...maps,

    FunctionDeclaration: from.FunctionDeclaration(
    {
            node => Node.FunctionDeclaration
            ({
                ...node,
                ...toParameterBindings(node.params),
                id: toIdentifierBinding(node.id),
                body: fromBabel(node.body)
            })
    })



//    StringLiteral: (maps, path, value) =>
//        console.log(value) || Node.StringLiteral({ value: value.value })
}, [], node));


//fromBabel;
*/

