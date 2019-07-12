const { data, number, string, union } = require("@algebraic/type");
const SourceLocation = require("./source-location");
const ESTreeBridge = require("./estree-bridge");


module.exports = union `Comment` (
    ESTreeBridge `Block` (
        ({override:type})   => "CommentBlock",
        value               => string,
        start               => number,
        end                 => number,
        loc                 => SourceLocation ),

    ESTreeBridge `Line` (
        ({override:type})   => "CommentLine",
        value               => string,
        start               => number,
        end                 => number,
        loc                 => SourceLocation ) );
