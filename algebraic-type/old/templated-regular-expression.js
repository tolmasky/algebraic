const partition = require("@climb/partition");
const fromEntries = require("@climb/from-entries");


module.exports = templateRegExp = (function ()
{
    const template = /\$\{[a-z]+\}/g;
    const extract = name => name.substr(2, name.length - 3);
    const dedupe = array => Array.from(new Set(array));
    const variables = source => dedupe((source.match(template) || []).map(extract));
    const insert = (source, values) => new RegExp(
        source.replace(template, match => `(?:${values[extract(match)].source})`));
    const insertAll = (tuples, values) => Object.assign(
        values,
        fromEntries(tuples.map(([name, source]) =>
            [name, insert(source, values)])));
    const has = hasOwnProperty.call.bind(hasOwnProperty);
    const depend = (bound, tuples) =>
        (([independent, dependent]) =>
            dependent.length <= 0 ?
                insertAll(independent, bound) :
                depend(insertAll(independent, bound), dependent))
        (partition(([,,variables]) =>
            variables.length <= 0 ||
            variables.every(variable => has(bound, variable)),
            tuples));
    
    return definitions => depend(Object.create(null), Object
        .entries(definitions)
        .map(([name, regexp]) => [name, regexp.source])
        .map(([name, source]) => [name, source, variables(source)]));
})();
