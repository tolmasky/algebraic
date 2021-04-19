const { type, caseof } = require("@algebraic/type");
const SourceLocation = require("./source-location");


const SingleLineComment = type `SingleLineComment`
({
    location    :of =>  SourceLocation `?`,
    value       :of =>  type.string
});

exports.SingleLineComment = SingleLineComment;

const MultiLineComment = type `MultiLineComment`
({
    location    :of =>  SourceLocation `?`,
    value       :of =>  type.string
});

exports.MultiLineComment = MultiLineComment;

const Comment = type `Comment`
([
    caseof (SingleLineComment),
    caseof (MultiLineComment)
]);

exports.Comment = Comment;

const Comments = type `Comments`
({
    leading     :of =>  Comment `[]`,
    inner       :of =>  Comment `[]`,
    trailing    :of =>  Comment `[]`,
});

exports.Comments = Comments;
