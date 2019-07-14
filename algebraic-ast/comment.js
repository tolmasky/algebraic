const { data, number, string, union } = require("@algebraic/type");
const SourceLocation = require("./source-location");
const ESTreeBridge = require("./estree-bridge");


module.exports = union `Comment` (
    ESTreeBridge `Block` (
        ([ESTreeType])      => data.always ("CommentBlock"),
        value               => string,
        start               => number,
        end                 => number,
        loc                 => SourceLocation ),

    ESTreeBridge `Line` (
        ([ESTreeType])      => data.always ("CommentLine"),
        value               => string,
        start               => number,
        end                 => number,
        loc                 => SourceLocation ) );
