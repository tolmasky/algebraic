const { parse } = require("@babel/core");
const { is, data, string, or, type, Δ } = require("@algebraic/type");
const given = f => f();

const to = Symbol("to");
const setting = Symbol("setting");
const casting = Symbol("casting");
const toObject = Symbol("toObject");
const { toPrimitive } = Symbol;

const Empty = Object.freeze({});

const toReferencedNames = ({ type, ...expression }) =>
    type === "Identifier" ?
        [expression.name] :
    type === "MemberExpression" ?
        toReferencedNames(expression.object) :
    type === "SpreadElement" ?
        toReferencedNames(expression.argument) :
    type === "ObjectExpression" ?
        expression.properties.flatMap(toReferencedNames) :
    type === "ObjectProperty" ?
        toReferencedNames(expression.value) :
        [];

const FieldSetting = data `FieldSetting` (
    dependencies    =>  type.array(string),
    compute         =>  Function );

const FieldCasting = data `FieldCasting` (
    TargetT             => Function );

const toFieldCasting = f =>
    FieldCasting({ TargetT: f() });

const toFieldSetting = (f, body) => given((
    dependencies = toReferencedNames(body)) =>
    FieldSetting(
    {
        dependencies,
        compute: new Function(
        `return ({${dependencies.join(", ")}}) => `+
        `(${(f + "").substring(body.start, body.end)})`)()
    }));

const fParseAssignment = (receiver, toFieldTranslation, f) => given((
    fString = f + "",
    { body, params } = parse(fString).program.body[0].expression,
    name = params[0].name) =>
        ({ ...receiver, [name]: toFieldTranslation(f, body) }));

const toProxy = (get, apply) => new Proxy(function(){},
{
    apply: (_, __, args) => apply(args[0]),
    get: (_, key) => get(key)
});

const WrappingTranslation = data `WrappingTranslation` (
    entries =>  type.array(type.object) );

const ValueTranslation = data `ValueTranslation` (
    type                =>  Function,
    pattern             =>  [type.object, Empty],
    keyPath             =>  [type.array(string), []],
    fieldSettings       =>  [type.object, Empty],
    fieldCastings       =>  [type.object, Empty] );

const toValueTranslationProxy = valueTranslation => toProxy(
    key =>
        key === setting ? f =>
            toValueTranslationProxy(
                valueTranslation.Δ(fieldSettings =>
                    fParseAssignment(fieldSettings, toFieldSetting, f))) :
        key === casting ? f =>
            toValueTranslationProxy(
                valueTranslation.Δ(fieldCastings =>
                    fParseAssignment(fieldCastings, toFieldCasting, f))) :
        key === toPrimitive ?
            () => BitMask.to(valueTranslation):
        key === toObject || key === "toObject" ?
            valueTranslation :
        toValueTranslationProxy(
            valueTranslation.Δ(keyPath => keyPath.concat(key))),
    newPattern =>
        toValueTranslationProxy(
            valueTranslation.Δ(pattern => ({ ...pattern, ...newPattern }))));

const BitMask = given((
    bitMasks = new Map(),
    to = translation => bitMasks.has(translation) ?
        bitMasks
            .get(translation) :
        bitMasks
            .set(translation, 1 << bitMasks.size)
            .get(translation),
    from = unioned =>
    [
        [...bitMasks.entries()]
            .map(([translation, mask]) =>
                (mask & unioned) && translation)
            .filter(translation => !!translation),
        bitMasks.clear()
    ][0]) => ({ from, to }));

function ValueTranslationSet()
{
    const translations = Object.create(null) ;

    return new Proxy({},
    {
        set: (translations, key, value) =>
            translations[key] =
                value && typeof value === "object" ?
                    [WrappingTranslation({ entries: Object.entries(value) })] :
                typeof value === "number" ?
                    BitMask
                        .from(value)
                        .map(translation => translation) :
                    [value[toObject]],
        get: (translations, key) => translations[key],
        ownKeys: translations => Object.keys(translations)
    });
}

module.exports = 
{
    toObject,
    setting,
    casting,
    Set: ValueTranslationSet,
    JS: Object.fromEntries(
        ["object", "null", "undefined", "boolean", "number", "string"]
            .map(typename =>
            [
                typename,
                toValueTranslationProxy(
                    ValueTranslation({ type: type[typename] }))
            ]))
}

console.log(module.exports.JS.object({ cheese: "pizza" })
    [setting](key => key2)
    [setting](key => key3)
    [setting](key3 => ({x,y}))
    [casting](key5 => (function X(){}))({andMore:"t"}).id.x.y.z[toObject].fieldSettings);


/*
console.log(module.exports.JS.object({ cheese: "pizza" })
    [setting].key [to].key2
    [setting].key [to].key3
    [setting].key3 [to] ((x,y) =>x+y)
    [casting].key5 [to] (function X(){})({andMore:"t"}).id.x.y.z[toObject]);
*/