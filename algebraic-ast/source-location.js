const { type, data } = require("@algebraic/type");


const Position = data `Position`
({
    index   :of =>  type.number,
    line    :of =>  type.number,
    column  :of =>  type.number
});

const SourceLocation = data `SourceLocation`
({
    start   :of =>  Position,
    end     :of =>  Position
});

module.exports = SourceLocation;
module.exports.SourceLocation = SourceLocation;
module.exports.Position = Position;
