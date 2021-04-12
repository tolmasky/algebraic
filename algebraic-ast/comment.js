const { type, data, List, caseof } = require("@algebraic/type");
const SourceLocation = require("./source-location");


const SingleLineComment = data `SingleLineComment`
({
    location    :of =>  SourceLocation `?`,
    value       :of =>  type.string
});

exports.SingleLineComment = SingleLineComment;

const MultiLineComment = data `MultiLineComment`
({
    location    :of =>  SourceLocation `?`,
    value       :of =>  type.string
});

exports.MultiLineComment = MultiLineComment;

const Comment = data `Comment`
([
    caseof (SingleLineComment),
    caseof (MultiLineComment)
]);

exports.Comment = Comment;

const Comments = data `Comments`
({
    leading     :of =>  List.of(Comment) `?`,
    inner       :of =>  List.of(Comment) `?`,
    trailing    :of =>  List.of(Comment) `?`
});

exports.Comments = Comments;
