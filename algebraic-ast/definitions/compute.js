const { data: { field } } = require("@algebraic/type");

const fNameRegExp = /([^=\s]+)\s*=>/;
const fNameParse = f => fNameRegExp.exec(f + "")[1];
const { isArray } = Array;
const inKeyPath = (type, empty, value, keys, index = 0) =>
    index === keys.length ?
        typeof value === "string" ? type([value]) : value :
        (child =>
            !child ? empty :
            !isArray(child) ? inKeyPath(type, empty, child, keys, index + 1) :
            child.reduce((set, item) =>
                    set.concat(inKeyPath(type, empty, item, keys, index + 1)),
                    empty))(value[keys[index]]);
    

module.exports = function compute(type, ...shorthandOperations)
{
    const empty = type();
    const toMethod = action => action === "take" ? "concat" : action;
    const operations = shorthandOperations
        .map(shorthand =>
            [toMethod(fNameParse(shorthand)), shorthand()])
        .map(([method, keyPath]) => ({ method, keys: keyPath.split(".") }));
    const dependencies = operations.map(({ keys }) => keys[0]);
    const compute = values => operations.reduce(
        (set, { keys, method }) =>
            set[method](inKeyPath(type, empty, values, keys)),
        empty);

    return field.definition(type).computed({ dependencies, compute });
}

module.exports.empty = function empty(type)
{
    return [type, () => type()];
}

