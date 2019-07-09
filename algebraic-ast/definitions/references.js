const { string } = require("@algebraic/type/primitive");
const { Set } = require("@algebraic/collections");
const { data: { field } } = require("@algebraic/type");
const { isArray } = Array;

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
            .union(...owners
                .map(key => values[key])
                .flatMap(value => isArray(value) ?
                    value.map(item => item.references) :
                    [value.references]) )
    });

module.exports.adopt = key =>
    field.definition(References).computed(
    {
        dependencies: [key],
        compute: values => values[key].references
    });
