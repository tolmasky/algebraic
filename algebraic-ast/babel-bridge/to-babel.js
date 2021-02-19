const { array, type, or, data } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const { TYPES, VISITOR_KEYS, NODE_FIELDS, FLIPPED_ALIAS_KEYS } = require("@babel/types");

const ArrayType = types => ({ kind: "array", types });
const NodeType = type => ({ kind:"node", type });
const UnionType = types => ({ kind: "union", types });
const PrimitiveType = type => ({ kind:"primitive", type });
const PrimitiveOrNodeType = type => (/[A-Z]/.test(type) ? NodeType : PrimitiveType)(type);

const fail = e => { throw e };
const { hasOwnProperty } = Object;
var i = 0;
const toType = (TN, field, validate) =>
    !validate ?
        fail("FAILED FOR " + TN + " " + field) :
    validate.chainOf ?
        validate.chainOf[0].type === "array" ?
            array(toType(TN, field, validate.chainOf[1].each || validate.chainOf[1])) :
        toType(TN, field, validate
            .chainOf
            .find(validate => Object.keys(validate).length > 0)) :
//    validate.type === "any" ?
//        fail("FOR: " + type + " " + field) :
    validate.type ?
        type[validate.type] :
    validate.oneOfNodeTypes ?
        union `${i++}` (validate.oneOfNodeTypes.map(name => is => Babel[name])) :
    validate.oneOfNodeOrValueTypes ?
        union `${i++}` (validate
            .oneOfNodeOrValueTypes
            .map(name => /[A-Z]/.test(name) ?
                is  => Babel[name] :
                is  => type[name])) :
    
    // This is "value enums", for example [true, false], or "+", "-", etc.
    // typeof true === "boolean", which is good.
    // typeof "+" === "string", which is good.
    validate.oneOf ?
        type[typeof validate.oneOf[0]] :

    // TemplateElement value
    validate.shapeOf ? type.any :
    (console.log(type, field, {...validate}),fail(TN + " " + field + " " + Object.keys(validate)));

//console.log({...NODE_FIELDS["ClassPrivateProperty"]["static"] }, NODE_FIELDS["ClassPrivateProperty"]["static"] +"");
// ({ ...NODE_FIELDS["File"]["comments"].validate })

const IGNORED_KEYS = { ClassPrivateProperty: { static: true } };

const Babel = Object.fromEntries(TYPES
    .filter(type => type !== "File")
    .map(type => [(console.log("DOING " + type + " " + FLIPPED_ALIAS_KEYS[type]),type),
        FLIPPED_ALIAS_KEYS[type] ?
            (console.log("UNION. " + type),union `${type}`
                (...FLIPPED_ALIAS_KEYS[type].map(TN => is => Babel[TN]))) :
            data ([type]) (...Object
                .keys(NODE_FIELDS[type] || {})
                .filter(key =>  !IGNORED_KEYS[type] ||
                                !IGNORED_KEYS[type][key])
                .filter(field =>    field !== "extends" &&
                                    field !== "default" &&
                                    field !== "const" &&
                                    field !== "decorators" &&
                                    field !== "typeAnnotation")
                .map(field =>(console.log(new Function("T", `return ${field} => T`)
                    (toType(type, field, NODE_FIELDS[type][field].validate))+"",NODE_FIELDS[type][field].validate,toType(type, field, NODE_FIELDS[type][field].validate)),
                    new Function("T", `return ${field} => T`)
                    (toType(type, field, NODE_FIELDS[type][field].validate)))))]));

//console.log(Babel);

//console.log(Babel.LVal);
//console.log(union.components(Babel.LVal));
console.log(Babel.Identifier);

console.log(data.fields(Babel.Identifier));
console.log(data.fields(Babel.MemberExpression));

/*
                
        .map(type => [type,  || {})])
        
        .map(([type, keys]) =>
        [
            type,
            IGNORED_KEYS[type] ?
                keys.filter(key => !IGNORED_KEYS[type][key]) :
                keys])
        .map(([type, fields = []]) => [type, data ([type])
            (...fields
                .filter(field => field !== "extends" && field !== "default" && field !== "const")
                .map(field =>
                    new Function("T", `return ${field} => T`)
                    (toType(type, field, NODE_FIELDS[type][field].validate))))])
]);
*/