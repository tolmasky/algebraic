const { hasOwnProperty } = Object;
const { isArray } = Array;
const { reduce } = Array.prototype;


exports.isTaggedCall = arguments =>
    isArray(arguments) &&
    isArray(arguments[0]) &&
    hasOwnProperty.call(arguments[0], "raw");


exports.resolve = (strings, ...arguments) => reduce.call(
    arguments,
    (string, argument, index) =>
        string + argument + strings[index + 1],
    strings[0]);
