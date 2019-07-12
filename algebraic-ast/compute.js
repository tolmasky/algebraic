const { data: { field } } = require("@algebraic/type");
const has = hasOwnProperty.call.bind(hasOwnProperty);

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
        .map(([method, item]) =>
            typeof item === "string" ?
                { method, keys: item.split(".") } :
                { method, items: item });
    const dependencies = operations
        .filter(operation => has(operations, "keys"))
        .map(({ keys }) => keys[0]);
    const compute = values => operations.reduce(
        (set, { items, keys, method }) =>
            set[method](keys ? inKeyPath(type, empty, values, keys) : items),
        empty);

    return field.definition(type).computed({ dependencies, compute });
}

module.exports.empty = function empty(type)
{
    return [type, () => type()];
}

