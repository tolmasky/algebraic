const { data: { field }, string } = require("@algebraic/type");
const { Set } = require("@algebraic/collections");
const { isArray } = Array;

const StringSet = Set(string);
const Empty = StringSet();


module.exports.in = ([inKey]) =>
({
    from: (...dependencies) => from(inKey, dependencies),
    lift
});

function lift (dependency)
{
    return field.definition(StringSet).computed(
    {
        dependencies: [dependency],
        compute: values => StringSet([values[dependency]])
    });
}

function from (inKey, dependencies)
{
    return field.definition(StringSet).computed(
    {
        dependencies,
        compute: values => Empty
            .union(...dependencies
                .map(key => values[key])
                .flatMap(value => isArray(value) ?
                    value.map(item => item[inKey]) :
                    [value[inKey]]) )
    });
}
