const toTranslate = require("./to-translate");
const Node = require("../node");


module.exports = toTranslate(
    new Set(Object
        .values(Node)
        .filter(T => T !== Node)),
    require("./migrations"));
