const template = require("./template");
const type = require("./type");
const given = f => f();

const toAppliedName = (FT, arguments) =>
    `${type.typename(FT)}(${arguments
        .map(T => type.typename(T))
        .join(", ") })`;

const apply = (T, { implementation }, ...arguments) =>
    template.isTaggedCall(arguments) ?
        (...nextArguments) => {console.log("in here!", `${template.resolve(...arguments)}`, (implementation(...nextArguments).prototype) instanceof type, implementation(...nextArguments), "done");
            return type
                `${template.resolve(...arguments)}`
                (implementation(...nextArguments))} :
    given((ResultT = implementation(...arguments)) =>
        ResultT.attributes.anonymous ?
            type `${toAppliedName(T, arguments)}` (ResultT) :
            ResultT);

module.exports = implementation => ({ apply, implementation });
