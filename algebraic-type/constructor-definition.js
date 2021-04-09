const { IObject } = require("./intrinsics");

const f = require("./function-define");
const fail = require("./fail");

const Field = require("./field");
const private = require("./private");

const isObject = value => value !== null && typeof value === "object";
const isFunction = value => typeof value === "function";



// Field declarations can be of 2 forms:
// 1. [{ K1: field-function [, KN: field-function]* }] for "named" fields.
// 2. Or [field-function [, field-function]*] for "positional" fields.
function ConstructorDefinition(name, fieldDeclarations, preprocess, initialize)
{
    if (!(this instanceof ConstructorDefinition))
        return new ConstructorDefinition(
            name, fieldDeclarations, preprocess, initialize);

    this.name = name;
    this.fieldDeclarations = fieldDeclarations;
    this.proprocess = preprocess;
    this.initialize = initialize || ((C, fields) => [fields]);

    const hasNamedFields =
        fieldDeclarations.length === 1 &&
        isObject(fieldDeclarations[0]);
    const hasPositionalFields =
        !hasNamedFields &&
        fieldDeclarations.every(isFunction);

    if (!hasNamedFields && !hasPositionalFields)
        fail (
            `Unrecognized field declarations for constructor ${name}:` +
            JSON.stringify(declarations));

    this.hasPositionalFields = hasPositionalFields;
    this.fieldDefinitions = IObject
        .entries(hasNamedFields ? fieldDeclarations[0] : fieldDeclarations);
}

module.exports = ConstructorDefinition;


function fields(C)
{
    return private(C, "fields", () =>
        private(C, "fieldDefinitions")
            .map(([name, f]) => [name, new Field(f())]));
}



//Constructor.fields = fields;
//Constructor.hasPositionalFields = C => private(C, "hasPositionalFields");

/*
function Constructor(T, instantiate, definition)
{
    const { preprocess, initialize } = definition;
    const C = f(name, (C, ...values) =>
    {
        const [result, preprocessed] = preprocess ?
            preprocess(C, ...values) :
            [false, values];

        return  result ||
                instantiate(T, initialize(process(C, preprocessed)));
    },
    Constructor.prototype);

    IObject.assign(C, definition);

    private(C, "fieldDefinitions", () => fieldDefinitions);

    return C;
}

/*
function toFieldDefinitions(fieldDeclarations)
{
    const hasNamedFields =
        fieldDeclarations.length === 1 &&
        isObject(fieldDeclarations[0]);
    const hasPositionalFields =
        !hasNamedFields &&
        fieldDeclarations.every(isFunction);

    if (!hasNamedFields && !hasPositionalFields)
        fail (
            `Unrecognized field declarations for constructor ${name}:` +
            JSON.stringify(declarations));

    return hasNamedFields ? 
        [false, IObject.entries(fieldDeclarations[0])] :
        [true, fieldDeclarations];
}*/
