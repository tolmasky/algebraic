const toCache = require("./cache");

module.exports = function variadic(fT)
{
    const cache = toCache();

    return { of: (...args) => cache(args, () => fT(...args)) };
}
