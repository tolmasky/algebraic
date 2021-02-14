const { TYPES, VISITOR_KEYS, NODE_FIELDS } = require("@babel/types");
const { hasOwnProperty } = Object;

const ArrayType = types => ({ kind: "array", types });
const NodeType = type => ({ kind:"node", type });
const UnionType = types => ({ kind: "union", types });
const PrimitiveType = type => ({ kind:"primitive", type });
const PrimitiveOrNodeType = type => (/[A-Z]/.test(type) ? NodeType : PrimitiveType)(type);

const toType = validate =>
    validate.chainOf ?
        validate.chainOf[0].type === "array" ?
            ArrayType(toType(validate.chainOf[1].each)) :
        toType(validate
            .chainOf
            .find(validate => Object.keys(validate).length > 0)) :
    validate.type ?
        PrimitiveType(validate.type) :
    validate.oneOfNodeTypes ?
        UnionType(validate.oneOfNodeTypes.map(NodeType)) :
    validate.oneOfNodeOrValueTypes ?
        UnionType(validate.oneOfNodeOrValueTypes.map(PrimitiveOrNodeType)) :
        fail(Object.keys(validate));

const FieldTypes = Object.fromEntries(TYPES
    .map(type => [type, VISITOR_KEYS[type]])
    .map(([type, fields = []]) =>
        [type, toType(NODE_FIELDS[type][field].validate)]));
        
        
require("@babel/types").FLIPPED_ALIAS_KEYS