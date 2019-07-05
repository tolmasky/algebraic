const fail = Object.assign(
    (...args) => { throw args.length > 1 ?
        new (args[0])(args[1]) : Error(args[0]); },
    { syntax: message => fail(SyntaxError, message) },
    { type: message => fail(TypeError, message) });

module.exports = fail;
