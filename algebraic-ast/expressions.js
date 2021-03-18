const type = require("@algebraic/type");
const Node = require("./node");


exports.AssignmentExpression = Node `AssignmentExpression`
({
    left                :of =>  Node.AssignmentTarget,
    right               :of =>  Node.Expression,
    operator            :of =>  type.string
});

const Intrinsic = type `Intrinsic`
({
    name                :of =>  type.string,
    keyword             :of =>  type.string `?`
});

exports.Intrinsic = Intrinsic;

exports.IntrinsicReference = Node `IntrinsicReference`
({
    intrinsic           :of =>  Intrinsic
});

exports.IdentifierReference = Node `IdentifierReference`
({
    name                :of =>  type.string,
});

exports.ArrowFunctionExpression = Node `ArrowFunctionExpression`
({
    body                :of =>  or (Node.BlockStatement, Node.Expression),
    id                  :of =>  type.null `=` (null), // fixme: some sort of "always"

    parameters          :of =>  array (Node.DefaultableBinding) `=` ([]),
    restParameter       :of =>  Node.RestElementBinding `?`,

    generator           :of =>  type.boolean `=` (false), // fixme: NEED ALWAYS, since CANT be generator
    async               :of =>  type.boolean `=` (false)
});

exports.FunctionExpression = Node `FunctionExpression`
({
    body                :of =>  Node.BlockStatement,
    id                  :of =>  Node.IdentifierBinding `?`,

    parameters          :of =>  array (Node.DefaultableBinding) `=` ([]),
    restParameter       :of =>  Node.RestElementBinding `?`,

    generator           :of =>  type.boolean `=` (false),
    async               :of =>  type.boolean `=` (false),
});

exports.ArrayExpression = Node `ArrayExpression`
({
    elements            :of =>  array(type.union (
                                    Node.Elision,
                                    Node.Expression,
                                    Node.SpreadElement)) `=` ([])
});

exports.CallExpression = Node `CallExpression`
({
    callee              :of =>  Node.Expression,
    arguments           :of =>  array(type.union (Node.Expression, Node.SpreadElement))
});

exports.ConditionalExpression = Node `ConditionalExpression`
({
    test                :of =>  Node.Expression,
    consequent          :of =>  Node.Expression,
    alternate           :of =>  Node.Expression
});

exports.BinaryExpression = Node `BinaryExpression`
({
    left                :of =>  Node.Expression,
    right               :of =>  Node.Expression,
    operator            :of =>  type.string
});

exports.LogicalExpression = Node `LogicalExpression`
({
    left                :of =>  Node.Expression,
    right               :of =>  Node.Expression,
    operator            :of =>  type.string
});

exports.MemberExpression = Node `MemberExpression`
({
    computed            :of =>  type.boolean `()=`
                                (({ property }) =>
                                    type.belongs(Node.Expression, property)),

    object              :of =>  Node.Expression,
    property            :of =>  type.union (Node.Expression, Node.IdentifierName),
    optional            :of =>  type.boolean `?`
});

exports.NewExpression = Node `NewExpression`
({
    callee              :of =>  Node.Expression,
    arguments           :of =>  type.array(type.union (
                                    Node.Expression,
                                    Node.SpreadElement))
});

exports.ThisExpression = Node `ThisExpression` ();

exports.SequenceExpression = Node `SequenceExpression`
({
    expressions         :of =>  type.array(Node.Expression)
});

exports.TaggedTemplateExpression = Node `TaggedTemplateExpression`
({
    tag                 :of =>  Node.Expression,
    quasi               :of =>  Node.TemplateLiteral
});

exports.UnaryExpression = Node `UnaryExpression`
({
    argument            :of =>  Node.Expression,
    operator            :of =>  type.string,
    prefix              :of =>  type.boolean `=` (true)
});

exports.UpdateExpression = Node `UpdateExpression`
({
    argument            :of =>  Node.Expression,
    operator            :of =>  type.string,
    prefix              :of =>  type.boolean `=` (true)
});

exports.YieldExpression = Node `YieldExpression`
({
    argument            :of =>  Node.Expression,
    delegate            :of =>  type.boolean `=` (false)
});

exports.AwaitExpression = Node `AwaitExpression`
({
    argument            :of =>  Node.Expression
});

// NOTE: I originally split ObjectProperty up into Longhand and Shorthand
// variants to try to make it impossible to construct impossible properties
// (like "shorthand" properties where the binding *isn't* an identifier
// binding), but this becomes cumbersome to interact with when actually
// manipulating the AST. The root of the problem is that shorthand properties
// (and their Binding and AssignmentTarget relatives) appear to have the
// (unique?) distinction of being a purely syntactic features with no semantic
// differences from normal properties. As such, it is strange to give them a
// semantic desgination in the AST.
//
// In order to balance the desire to not have impossible ASTs *and* provide
// an ergonomic interface, I settled on having a user-settable
// "prefersShorthand" property, with "canBeShorthand" and "shorthand" *computed*
// properties. When prefersShorthand is true and canBeShorthand evaluates to
// true, the code printer will generate shorthand properties, but otherwise
// there is no real difference with interacting with these objects. We default
// the "prefersShorthand" property to true so that by default we always generate
// compact properties whenever possible. Upon parsing, "prefersShorthand" will
// be true when the target source's author chose the shorthand, so that if you
// perform a series of operations that lead to it still being shorthandable, it
// will be.

exports.ObjectProperty = Node `ObjectProperty`
({
    computed            :of =>  type.boolean `()=`
                                (({ key }) => type.belongs
                                    (Node.ComputedPropertyName, key)),

    canBeShorthand      :of =>  type.boolean `()=`
                                (({ key, value }) =>
                                    type.belongs(Node.IdentifierName, key) &&
                                    type.belongs(Node.IdentifierReference, value) &&
                                    key.name === value.name),

    shorthand           :of =>  type.boolean `()=`
                                (({ canBeShorthand, prefersShorthand }) =>
                                    canBeShorthand && prefersShorthand),

    prefersShorthand    :of =>  type.boolean `=` (true),

    key                 :of =>  Node.PropertyName,
    value               :of =>  Node.Expression,
});

exports.ObjectExpression = Node `ObjectExpression`
({
    properties          :of =>  type.array (type.union (
                                    Node.ObjectProperty,
                                    Node.SpreadElement))
});

exports.SpreadElement = Node `SpreadElement`
({
    argument            :of =>  Node.Expression
});

Object.assign(exports, require("./literals"));
