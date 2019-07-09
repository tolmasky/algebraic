const { string } = require("@algebraic/type/primitive");
const { Set } = require("@algebraic/collections");
const { data: { field } } = require("@algebraic/type");

const References = Set(string);
const Empty = References();

module.exports = Set(string);
module.exports.Empty = Empty;
module.exports.Never = [References, () => Empty];

module.exports.union = (...owners) =>
    field.definition(References).computed(
    {
        dependencies: owners,
        compute: values => Empty
            .union(...owners.map(key => values[key].references))
    });

module.exports.union.all = key =>
    field.definition(References).computed(
    {
        dependencies: [key],
        compute: values => Empty
            .union(...values[key].map(value => value.references))
    });

module.exports.adopt = key =>
    field.definition(References).computed(
    {
        dependencies: [key],
        compute: values => values[key].references
    });
