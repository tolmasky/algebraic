const fail = Object.assign(
    (Error, message) => { throw Error(message); },
    { syntax: message => fail(SyntaxError, message) },
    { type: message => fail(TypeError, message) });

module.exports = fail;
