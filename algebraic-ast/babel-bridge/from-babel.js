const { fromEntries } = Object;
const { is, parameterized, data, type } = require("@algebraic/type");
const { parameters } = parameterized;
const given = f => f();

const Node = require("../node");
const { toDefaultTranslation, ...mappings } = require("./migrations");

// Don't forget explicitly transferred fields
const toFieldMappings = (TargetT, translations) => given((
    fields = data
        .fields(TargetT)
        .filter(field =>
            is (data.field.definition.supplied, field.definition))
        .map(field => [field.name, parameters(field)[0]]),
    TargetTN = type.name(TargetT),
    translationsTN = translations[TargetTN]) =>
        fromEntries((translationsTN || [toDefaultTranslation(TargetTN)])
            .map(({ pattern, fields: fieldRemappings }) =>
            [
                pattern.type,
                fields
                    .filter(([name, FieldT]) =>
                        fieldRemappings[name] ||
                        type.kind(FieldT) !== type.primitive)
                    .map(([name, FieldT]) =>
                    [
                        name,
                        fieldRemappings[name] || name,
                        type.name(FieldT),
                        FieldT
                    ])
            ])));
        
/*
        .filter(([name, FieldT]) =>
            mappings[name] || 
            type.kind(FieldT) !== type.primitive)
        .map(([name, FieldT]) =>
        [
            name,
            fromEntries(
                customized[TargetTN]
                    .map(from => [from.pattern.type, from.fields])),
            type.name(FieldT),
            FieldT
        ]));
*/

console.log(mappings["DefaultedAssignmentTarget"][0]);

console.log("--->", toFieldMappings(Node.DefaultedAssignmentTarget, mappings).AssignmentPattern);

console.log("--->", toFieldMappings(Node.WhileStatement, mappings));
