const { CodeGenerator } = require("@babel/generator");
const { constructor: Generator } =
    Object.getPrototypeOf(new CodeGenerator()._generator);

class IntrinsicGenerator extends Generator
{
    IntrinsicReference(node, ...rest)
    {
        this.exactSource(node.loc, () =>
            this.word(`%${node.intrinsic.name}%`));
    }

    CallExpression(node, ...rest)
    {
        if (!isKeywordCompatibleIntrinsicCall(node))
            return super.CallExpression(node, ...rest);

        this.word(node.callee.intrinsic.keyword);
        this.space();
        this.print(node.arguments[0]);
    }
};

const isKeywordCompatibleIntrinsicCall = node =>
    node.type === "CallExpression" &&
    node.callee.type === "IntrinsicReference" &&
    !!node.callee.intrinsic.keyword &&
    node.arguments.length === 1;


module.exports = (ast, ...rest) =>
    new IntrinsicGenerator(ast, ...rest).generate().code

module.exports.IntrinsicGenerator = IntrinsicGenerator;
