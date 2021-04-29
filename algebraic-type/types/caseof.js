const { IObject } = require("../intrinsics");
const { isTaggedCall, tagResolve } = require("../templating");
const { f, constructible } = require("../function-define");

const isObject = value => value && typeof value === "object";
const isFunction = value => typeof value === "function";


const caseof = constructible ("caseof",
    (caseof, ...arguments) =>

        arguments.length === 2 &&
        isObject(arguments[0]) &&
        isObject(arguments[1]) ?
            instanceCaseOf(...arguments) :

        isTaggedCall(arguments) ?
            toCaseOf(f (
                tagResolve(...arguments),
                ({ name }, ...body) =>
                    toCaseOf({ name }, body))) :

        arguments.length >= 2 ?
            toCaseOf(
                { name: arguments[0] },
                arguments.slice(1)) :

        arguments.length === 1 &&
        isFunction(arguments[0]) ?
            toCaseOf({ name: false }, arguments) :

        fail ("Unrecognized caseof format."));

module.exports = caseof;

const CaseOfPrototype = caseof.prototype;

const toCaseOf = (target, body = []) =>
    IObject.setPrototypeOf(
        IObject.assign(target, { body }),
        CaseOfPrototype);
