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
    loc: mapSourceLocation(node.loc)
});

const Node = require("./node");
const toMapNode = function (mappings)
{
    const { VISITOR_KEYS } = require("@babel/types");
    const undeprecated = require("./babel/undeprecated-types");
    const mapNodeFields = (fields, node) => Object
        .fromEntries(fields.map(field =>
            [field, mapNullableNode(node[field])]));
    const toMapTrivialNode = (name, fields) => node =>
        Node[name]({
            ...node,
            ...mapNodeFields(fields, node),
            ...mapCommonNodeFields(node) });
    const trivialNodeMappings = Object.fromEntries(
        undeprecated.map(name =>
            [name, toMapTrivialNode(name, VISITOR_KEYS[name])]));
    const mapNode = node => ((type, trivial) =>
        (mappings[type] ? mappings[type](trivial) : trivial))
        (node.type, trivialNodeMappings[node.type](node));
    const mapNullableNode = mapNullable(mapNode);

    return mapNode;
}
const mapNode = toMapNode(
{
    Identifier: Node.IdentifierExpression,
});


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
