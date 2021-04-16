const type = require("@algebraic/type");


module.exports = type `Extra` .forall (T =>
({
    raw         :of =>  type.string,
    rawValue    :of =>  T
}));
