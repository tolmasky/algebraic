const fromEntries = require("@climb/from-entries");

const BabelTypes = require("@babel/types").TYPES;
const { QuerySet, Query } = require("./object-query");


exports.Babel =
{
    ...Query,
    ...fromEntries(BabelTypes
        .map(type => [type, Query.object({ type })]))
};

exports.Node = QuerySet;
