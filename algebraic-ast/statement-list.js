const { type, caseof } = require("@algebraic/type");
const Statement = require("./statement");

// https://tc39.es/ecma262/#prod-StatementListItem

const StatementListItem = type `StatementListItem`
([
    caseof `.Statement` (of => Statement)
    // caseof (Declaration)
]);

exports.StatementListItem = StatementListItem;

exports.StatementList = StatementListItem `[]`;
