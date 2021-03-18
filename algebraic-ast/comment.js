const type = require("@algebraic/type");
const SourceLocation = require("./source-location");


exports.SingleLineComment = type `SingleLineComment`
({
    location    :of =>  SourceLocation `?`,
    value       :of =>  type.string
});

exports.MultiLineComment = type `MultiLineComment`
({
    location    :of =>  SourceLocation `?`,
    value       :of =>  type.string
});

exports.Comment =
    type.union `Comment` (exports.SingleLineComment, exports.MultiLineComment);

exports.Comments = type `Comments`
({
    leading     :of =>  type.array(exports.Comment) `?`,
    inner       :of =>  type.array(exports.Comment) `?`,
    trailing    :of =>  type.array(exports.Comment) `?`
});
