const given = f => f();
const fromEntries = require("@climb/from-entries");

const { data, string, number, type, or } = require("@algebraic/type");
const { parameterized: { parameters } } = require("@algebraic/type/parameterized");
const Node = require("./node");

Node.IdentifierReference = Node.IdentifierExpression;

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
    const { type, data, parameterized, tnull, array, nullable } = require("@algebraic/type");
    const union = require("@algebraic/type/union-new");
    const Extra = require("./extra");

    const FieldKeyMappings = fromEntries([
        [[
            "ArrowFunctionExpression",
            "FunctionExpression",
            "FunctionDeclaration"
        ], { parameters: "params", restParameter: "params" }],
        [[
            "ArrayPatternBinding",
            "ArrayAssignmentTarget"
        ], { restElement: "elements" }],
        [[
            "ObjectPatternBinding",
            "ObjectAssignmentTarget",
        ], { restProperty: "properties" }]]
        .flatMap(([BabelTNs, mappings]) =>
            BabelTNs.map(BabelTN => [BabelTN, mappings])));

    const mapNull = (maps, path, value) =>
        value === null ? null : failToMap({ path, expected: tnull, value });

    // Extra<T> is a special case because the *incoming* nodes might have this
    // set to null... mainly because we don't bother to assign it to null.
    const toMapExtra = ExtraT => given((
        ValueT = parameters(ExtraT)[0]) =>
    [
        [],
        (maps, path, value) =>
            value === undefined ? null : ExtraT(value)
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
                    (console.log("CONVERTING ",value),NodeT(mapNodeFields(maps, path, value))),
            { fields: mapNodeFields })
        ]);
const SAFENAME = x => { try { return type.name(x); } catch (e) { return x; } }

    const NotFound = { };
    const foundOr = (value, or) =>
        value !== NotFound ? value : or();
    const toMapUnion = UnionT => given((
        Ts = union.components(UnionT),
        typenames = Ts.map(T => type.name(T)),
        count = Ts.length) =>
        [
            Ts,
            (maps, path, value) =>
                foundOr(typenames.reduce((mapped, typename, index) =>
                    foundOr(mapped, () =>
                        recover(() => maps[typename](maps, path, value))
                            .on(error => error.path === path ?
                                (console.log(toKeyPath(path) + " failed for " + SAFENAME(error.expected), value),NotFound) :
                                (console.log(error),console.log(toKeyPath(path), "vs.", toKeyPath(error.path)), failToMap(error)))),
                        NotFound),
                    () => failToMap({ expected: UnionT, path, value }))
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
})();

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

    ...
    [
//      If we can get Binding and AssignmentTarget to have the right Defaultables,
//      Then we could merge all of these.
//        [Node.ObjectProperty, Node.Expression, Node.IdentifierExpression, "value"],
        [Node.PropertyBinding, Node.DefaultableBinding],
        [Node.PropertyAssignmentTarget, Node.DefaultableAssignmentTarget]
    ].flatMap(([NodeT, ValueT]) => given((
        NodeTN = type.name(NodeT),
        ValueTN = type.name(ValueT),
        valueProperty = NodeTN.match(/([A-Z][a-z]*)$/)[1].toLowerCase()) =>
        [
            ["Longhand", "PropertyName", false, ],
            ["Shorthand", "IdentifierName", true]
        ].map(([prefix, KeyTN, shorthand]) =>
            to[`${prefix}${NodeTN}`]
            .from.ObjectProperty((maps, path, value) =>
            ({
                key: maps[KeyTN](maps, ["key", path], value.key),
                [valueProperty]: maps[ValueTN](maps, ["value", path], value.value)
            }))))),

    to.DefaultedAssignmentTarget
        .from.AssignmentPattern((maps, path, value) =>
        ({
            target: maps.AssignmentTarget(maps, ["left", path], value.left),
            fallback: maps.Expression(maps, ["right", path], value.right)
        })),

    to.ArrayPatternBinding.from.ArrayPattern,
    to.ObjectPatternBinding.from.ObjectPattern,
    to.RestPropertyBinding.from.RestElement,

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
        })),

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
*/

/*
    to.LonghandPropertyAssignmentTarget.from.ObjectProperty(
        { shorthand: false },
        (maps, path, value) =>
        ({
            key: maps.PropertyName(maps, ["key", path], value.key),
            target:
                maps.DefaultableAssignmentTarget(maps, ["value", path], value.value)
        })),

    to.ShorthandPropertyAssignmentTarget.from.ObjectProperty(
        { shorthand: true },
        (maps, path, value) =>
        ({
            key: maps.IdentifierName(maps, ["key", path], value.key),
            binding: maps.DefaultableAssignmentTarget(maps, ["value", path], value.value)
        })),
*/

/*
const given = Object.assign(
    f => f(),
    {
        defer: (f, initialized = false) =>
        (...args) =>
            (initialized || (initialized = f()))(...args)
    });
*/

/*
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
*/
