const { data, nullable, array, number, getTypename, or } = require("@algebraic/type");

const SourceLocation = require("./source-location");
const Comment = require("./comment");


const expressions = Object
    .values(require("./expressions"))
    .filter(statement => getTypename(statement).endsWith("Expression"));
const statements = Object
    .values(require("./statements"))
    .filter(statement => getTypename(statement).endsWith("Statement"));

Object.assign(module.exports,
{
    Expression: or(...expressions),
    Statement: or(...statements),
    ...require("./property-names"),
    ...require("./expressions"),
    ...require("./patterns"),
    ...require("./statements")
});



/*
const ESTreeBridge = require("./estree-bridge");
const References = require("./references");

const Group = require("./group");
const fieldsof = type => data
    .fields(type)
    .filter(field => (type =>
        Group.belongs(Node, type) ||
        Group.belongs(module.exports.Expression, type) || type === Array)
        (parameterized.parameters(field)[0]));

const getP = field => parameterized.parameters(field)[0];

const Node = Group `Node` (([name]) => function (...fields)
{
    const names = fields
        .map(data.field.toFieldDeclaration)
        .map(declaration => declaration.name);
    const hasCustomReferencesDefinition =
        names.indexOf("references") >= 0;

    const dummy = data ([`dummy-${name}`]) (...fields);
    const withReferencesField =
        hasCustomReferencesDefinition ?
            fields :
            [...fields, ([references]) =>
                (dependencies => (console.log(fieldsof(dummy).map(field => field)),dependencies.length === 0 ?
                    References.Never :
                    References.from(...dependencies)))
                (fieldsof(dummy).map(field => field.name))];

    return ESTreeBridge ([name]) (
        ...withReferencesField,
        leadingComments     => [nullable(array(Comment)), null],
        innerComments       => [nullable(array(Comment)), null],
        trailingComments    => [nullable(array(Comment)), null],
        start               => [nullable(number), null],
        end                 => [nullable(number), null],
        loc                 => [nullable(SourceLocation), null] );
});

// traversable getter!

module.exports = Node;
module.exports.Node = Node;
module.exports.Expression = require("./expression");

// for (const x of Object.keys(Node))
//    if (x !== "Node" && x !== "Expression")
//console.log(data.fields(Node["IdentifierExpression"]));
//console.log(Node.IdentifierExpression({ name:"x" }));
//console.log(require("@algebraic/type").is(require("./expression"), Node.IdentifierExpression({ name:"x" })));
//console.log("--> " + Group.belongs(Node, Node["IdentifierExpression"]));
*/
