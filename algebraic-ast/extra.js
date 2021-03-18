const type = require("@algebraic/type");


module.exports = type `Extra` (T => type
({
    raw         :of => type.string,
    rawValue    :of => T
}));
