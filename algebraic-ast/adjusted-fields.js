const { data, string } = require("@algebraic/type");
const { fromJS } = require("@algebraic/collections/node_modules/immutable");
const nullable = (...oneOfNodeTypes) => ({ oneOfNodeTypes, optional: true }); 
const types = (...oneOfNodeTypes) => ({ oneOfNodeTypes });

const names = (function ()
{
    const { Set } = require("@algebraic/collections");
    const empty = Set(string)();
    const fromScalar = node => node.names;
    const fromVector = nodes => nodes.reduce(
        (names, node) => names.concat(node.names),
        empty);
    const toReducer = (f, key) =>
        Function("f", `return ${key} => f(${key})`)(f);

    const { field } = require("@algebraic/type").data;
    const name = "names";
    const fieldT = field(Set(string));

    const toDeclare = compute => field.declare({
        create: () =>
            fieldT({ name, init: fieldT.init.compute({ compute }) }) });
    const scalar = key => toDeclare(toReducer(fromScalar, key));
    const vector = key => toDeclare(toReducer(fromVector, key));

    return { scalar, vector }
})();

const changed = fromJS(require("@babel/types").NODE_FIELDS)

    // ObjectProperty's value is Expression | PatternLike to allow it to do
    // double-duty as a member of an ObjectExpression and ObjectPattern.
    // However, since we have a separate ObjectPatternProperty, we don't need
    // PatternLike anymore.
    .setIn(["ObjectProperty", "value", "validate"], types("Expression"))

    // CatchClause's is a binding.
    .setIn(["CatchClause", "param", "validate"], nullable("IdentifierPattern"))

    .setIn(["AssignmentExpression", "left", "validate"], nullable("RootPattern"))
    .setIn(["AssignmentExpression", "names", "validate"], names.scalar("left"))

    // This needs to be nullable because it can be null in export default
    // function () { } case.
    .setIn(["FunctionDeclaration", "id", "validate"], nullable("IdentifierPattern"))

    .setIn(["FunctionExpression", "id", "validate"], nullable("IdentifierPattern"))

    .setIn(["AssignmentPattern", "left", "validate"], types("RootPattern"))
    .setIn(["RestElement", "names"], names.scalar("argument"))


    // We currently don't parameterize Arrays, so don't do anything to this yet.
    //.setIn(["ArrayPattern", "elements", "validate"],
    //    types("IdentifierPattern", "ObjectPattern", "ArrayPattern"))

    .setIn(["ClassDeclaration", "id", "validate"], types("IdentifierPattern"))
    .setIn(["ClassExpression", "id", "validate"], types("IdentifierPattern"))
    .setIn(["ClassImplements", "id", "validate"], types("IdentifierPattern"))

    // [a <- reference] as [b <- useless in our scope]
    .setIn(["ExportSpecifier", "local", "validate"], types("IdentifierExpression"))
    .setIn(["ExportDefaultSpecifier", "exported", "validate"], types("IdentifierExpression"))
    .setIn(["ImportDefaultSpecifier", "local", "validate"], types("IdentifierPattern"))
    
    .setIn(["PrivateName", "id"], types("IdentifierPattern"))
    // ExportNamespaceSpecifier
    // ImportNamespaceSpecifier ?
    // ImportSpecifier ?

module.exports = Object
    .entries(require("./additional-fields"))
    .reduce((fields, [typename, type]) =>
        data.fields(type).reduce((fields, field) =>
            fields.setIn([typename, field.name],
                data.field.declare({ create: () => field })),
            fields),
        changed).toJS();
