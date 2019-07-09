const { nullable, array, number } = require("@algebraic/type");
const SourceLocation = require("./source-location");
const Comment = require("./comment");
const ESTreeBridge = require("./estree-bridge");


module.exports = ([name]) =>
    (...fields) => ESTreeBridge ([name]) (
        ...fields,
        leadingComments     => [nullable(array(Comment)), null],
        innerComments       => [nullable(array(Comment)), null],
        trailingComments    => [nullable(array(Comment)), null],
        start               => [nullable(number), null],
        end                 => [nullable(number), null],
        loc                 => [nullable(SourceLocation), null] );
