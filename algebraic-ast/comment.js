const { data, number, string } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const SourceLocation = require("./source-location");
const ESTreeBridge = require("./estree-bridge");


module.exports = union `Comment` (
    is  => ESTreeBridge `Block` (
        ([ESTreeType])      => data.always ("CommentBlock"),
        value               => string,
        start               => number,
        end                 => number,
        loc                 => SourceLocation ),

    or  => ESTreeBridge `Line` (
        ([ESTreeType])      => data.always ("CommentLine"),
        value               => string,
        start               => number,
        end                 => number,
        loc                 => SourceLocation ) );
