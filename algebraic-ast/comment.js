const { data, array, string, nullable } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const Node = require("./node");


exports.Comment = union `Comment` (
    is                      =>  Node.SingleLineComment,
    or                      =>  Node.MultiLineComment );

exports.SingleLineComment = Node `SingleLineComment` (
    value                   =>  string );

exports.MultiLineComment = Node `MultiLineComment` (
    value                   =>  string );

exports.Comments = data `Comments` (
    leading                 =>  [nullable(array(Node.Comment)), null],
    inner                   =>  [nullable(array(Node.Comment)), null],
    trailing                =>  [nullable(array(Node.Comment)), null] );
