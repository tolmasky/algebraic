const { type, List, caseof } = require("@algebraic/type");
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
    leading     :of =>  type.object `=` ([]), // List.of(Comment) `?`,
    inner       :of =>  type.object `=` ([]), // List.of(Comment) `?`,
    trailing    :of =>  type.object `=` ([]), // List.of(Comment) `?`
});

exports.Comments = Comments;
