const { type, data } = require("@algebraic/type");


module.exports = data `Extra` .forall (T =>
({
    raw         :of =>  type.string,
    rawValue    :of =>  T
}));
