const { array, type, or, data, maybe, nullable } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const fail = require("@algebraic/type/fail");
const { TYPES, NODE_FIELDS, FLIPPED_ALIAS_KEYS } = require("@babel/types");

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
        or (...validate.oneOfNodeTypes.map(name => Babel[name])) :
    validate.oneOfNodeOrValueTypes ?
        or (...validate
            .oneOfNodeOrValueTypes
            .map(name => (/[A-Z]/.test(name) ? Babel : type)[name])) :
    
    // This is "value enums", for example [true, false], or "+", "-", etc.
    // typeof true === "boolean", which is good.
    // typeof "+" === "string", which is good.
    validate.oneOf ?
        type[typeof validate.oneOf[0]] :

    // TemplateElement value
    validate.shapeOf ? type.any :
    (console.log(type, field, {...validate}),fail(TN + " " + field + " " + Object.keys(validate)));

console.log({...NODE_FIELDS["ClassPrivateProperty"]["static"] }, NODE_FIELDS["ClassPrivateProperty"]["static"] +"");

Error.stackTraceLimit = 100000;

const given = f => f();
const Babel = Object.fromEntries(TYPES
    .filter(type => type !== "File")
    .map(type => [type,
        FLIPPED_ALIAS_KEYS[type] ?
            union `${type}`
                (...FLIPPED_ALIAS_KEYS[type].map(TN => is => Babel[TN])) :
            data ([type]) (...Object
                .keys(NODE_FIELDS[type] || {})
                .map(name => [name, NODE_FIELDS[type][name]])

                // As of this writing, ClassPrivateProperty.static is just
                // { default: null } with no validate.
                .filter(([, { validate }]) => !!validate)
                .map(([name, { validate, optional, default: fallback }]) =>
                    data.field.deferred
                    ({
                        name,
                        λdefinition: () => given((
                            TB = toType(type, name, validate),
                            TF = optional ? nullable(TB) : TB) =>
                            data.field.definition.supplied(TF)
                                ({ fallback: fallback === null && !optional ?
                                        maybe(TF).nothing :
                                        maybe(TF).just({ value: fallback }) }))
                    })))]));
/*
console.log(Babel);
*/
console.log(Babel.LVal);
console.log(union.components(Babel.LVal));
console.log(Babel.Identifier);

console.log(data.fields(Babel.Identifier));
console.log(data.fields(Babel.MemberExpression));
