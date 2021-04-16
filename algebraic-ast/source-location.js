const type = require("@algebraic/type");


const Position = type `Position`
({
    index   :of =>  type.number,
    line    :of =>  type.number,
    column  :of =>  type.number
});

const SourceLocation = type `SourceLocation`
({
    start   :of =>  Position,
    end     :of =>  Position
});

module.exports = SourceLocation;
module.exports.SourceLocation = SourceLocation;
module.exports.Position = Position;
