const { IObject } = require("../intrinsics");
/*const { setPrototypeOf } = IObject;
const { isTaggedCall, tagResolve } = require("../templating");

const { inspect } = require("util");
const inspectSymbol = inspect.custom;

const private = require("../private");
const fail = require("../fail");
const DIS = require("@algebraic/dense-int-set");

const { f, constructible } = require("../function-define");

const onPrototype = { [inspectSymbol]: inspectSum };
const isObject = value => value && typeof value === "object";
*/
const { type, of, definition, fallback } = require("../type");
const caseof = require("./caseof");
const Field = require("../field");
const { Set } = global;


exports.Union = (name, body) =>
({
    name,
/*    onPrototype,
    toDefaultValue: body
        .reverse()
        .find(item => item instanceof fallback) || false,*/
    fMembers: body.map(caseof => caseof.body),
    constructors: [{ name, fields:[of => toField(body)], initialize }]
});


function toField(caseofs)
{console.log(caseofs.map(caseof => caseof.body[0]));
    const Ts = new Set(caseofs.map(caseof => caseof.body[0]()));
    const has = value => Ts.has(type.of(value));

    return new Field(has);
}

function initialize(constructor, processed)
{
    const values = IObject.assign([], processed);

    return [false, { constructor, values }];
}

exports.isUnionBody = declaration =>
    declaration.length > 0 &&
    declaration.every(item =>
        item instanceof caseof &&
        item.name === false /*||
        item instanceof fallback*/);