const { CodeGenerator } = require("@babel/generator");
const { constructor: Generator } =
    Object.getPrototypeOf(new CodeGenerator()._generator);


class IntrinsicGenerator extends Generator
{
    constructor(ast, { onIntrinsic, ...options } = { }, code)
    {
        super(ast, options, code);

        this.onIntrinsic = onIntrinsic;
    }

    IntrinsicReference(node, ...rest)
    {
        if (!this.onIntrinsic ||
            !this.onIntrinsic(node, ...rest))
            this.exactSource(node.loc, () =>
                this.word(`%${node.intrinsic.name}%`));
    }
}

// FIXME: pass onIntrinsic to generate instead?
module.exports = (...args) => (new IntrinsicGenerator(...args)).generate().code;
