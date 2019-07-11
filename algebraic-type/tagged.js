const has = hasOwnProperty.call.bind(hasOwnProperty);
const tagged = Object.assign(f =>
    (...args) => tagged.is(args) ?
    (...more) => f(tagged.resolve(...args), ...more) :
    f(false, ...args),
    {
        is: args => Array.isArray(args[0]) && has(args[0], "raw"),
        resolve: (strings, ...args) =>
            args.reduce((string, arg, index) =>
                string + arg + strings[index + 1],
                strings[0])
    });

module.exports = tagged;


