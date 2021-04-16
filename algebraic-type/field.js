const { IObject } = require("./intrinsics");
const { has } = IObject;

const f = require("./function-define");
//const type = require("./type");
const fail = require("./fail");
const private = require("./private");


function Field(options)
{
    return  options instanceof Field ?
                options :
            options instanceof type ?
                new Field({ type: options }) :
            !(this instanceof Field) ?
                new Field(options) :
            IObject.assign(this,
            {
                default:
                    has("defaultValue", options) ?
                        new Default.Value(options.defaultValue) :
                        Default.None,
                constraint: new Constraint(options.type)
            });
}

module.exports = Field;

Field.prototype.extract = function (forT, name, values)
{
    const present = has(name, values);

    if (!present && this.default === Default.None)
        fail.type(
            `${toTypeString(forT)} constructor requires field ` +
            `${toValueString(name)}.`);

    // FIXME: Do computed correctly...
    if (!present)
        return this.default instanceof Default.Value ?
            this.default.value :
            this.default.computed();

    const value = values[name];

    if (!this.constraint.has(value))
        fail.type(
            `${toTypeString(forT)} constructor passed invalid value` +
            ` for field ${toValueString(name)}:\n` +
            `  Expected: type ${toTypeString(this.constraint.type)}\n` +
            `  Found: ${toValueString(value)} ` +
            `of type ${toTypeString(type.of(value))}`);

    return value;
}

function Constraint(type)
{
    this.type = type;
}

Constraint.prototype.has = function (value)
{
    return type.has(this.type, value);
}

const Default =
{
    None: Symbol("Default.None"),
    Value: f.constructible `Default.Value`
        (function (f, value) { this.value = value } ),
    Computed: f.constructible `Default.Computed`
        (function (f, computed) { this.computed = computed })
};

Field.Default = Default;

const highlighted = ([color]) => string => `${color}${string}\x1b[0m`;
const toTypeString = T => highlighted `\x1b[36m` (type.typename(T));
const toValueString = value => highlighted `\x1b[35m` (
    value === void(0) ? "undefined" :
    value === null ? "null" :
    typeof value === "function" ? `[function ${value.name}]` :
//    typeof value !== "object" ? JSON.stringify(value, null, 2) :
//    of(value) && getKind(of(value)) ? value + "" :
    JSON.stringify(value, null, 2));


const type = require("./type");

    // FIXME: UGH.
/*    const MISSING = { };
    const defaultValue = private(value, "defaultValue", () => MISSING);

    this.default = defaultValue !== MISSING ?
        new Default.Value(defaultValue) :
        Default.None;*/

