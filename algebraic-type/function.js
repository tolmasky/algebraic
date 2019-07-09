const { ftype } = require("./primitive");
const { parameterized } = require("./parameterized");

module.exports = parameterized ((...Ts) => ftype);
