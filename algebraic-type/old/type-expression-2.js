const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, f) =>
    fNamed(name, Object.setPrototypeOf(f, prototype));
    
    
module.exports = function TypeExpression(...args)
{
   if (!(this instanceof TypeExpression))
        return (...rest) => new TypeExpression(args[0][0], ...rest);

    const [name, initialize, satisfies, construct] = args;
    const TE = fNamed(name, function (...args)
    {
        return  isTaggedTemplateCall(args) ?
                    (...nextArgs) => E(resolveTagArguments(...args), ...nextArgs) :
                this instanceof E ?
                    Object.defineProperty(
                        this,
                        Definition,
                        { value: { ...initialize(...(typeof args[0] === "string" ? args : [`<anonymous ${name}>`, ...args])), satisfies, construct } }) :
                given((T = E.apply(fPrototyped(E.prototype, name, function (...args)
                {
                    return !construct ?
                        fail.type(`${name} is not a constructable type`) :
                        construct.call(this, T, T[Definition], args);
                }), args)) => fNamed(T[Definition].name/*args[0]*/, T));
    });
    Object.setPrototypeOf(E.prototype, Function.prototype);

    return E;
}

function term(name, definition)
{
    return fNamed(name, function ()
    {
    });
}

// 0. Type operators = ? or etc
// 1. Check if already instanceof THIS_TYPE, if so, just return that.
// 2. Check if THIS instanceof THIS_TYPE, if not new THIS_TYPE
// 3. If that instanceof this.base, just fast-copy.


    isConstructed = ) =>
    !construtable ? fail(NominalT) :
    definition.evaluated.initialize(
        this instanceof NominalT ?
            
            , definition) :
    
    
term(
    
    
    
    isConstructed && !constructable ? fail() :
    !isConstructed && constructable ? 
    
constructible ?
    

const data = term `data` (
    (...fFields) => ({ fFields }),
    (criterion, candidate) => false,
    (constructor, definition, values) =>
        values instanceof constructor ? values :
        Object.assign(
            new constructor(),
            values instanceof definition.base ?
                value :
                Object.fromEntries(
                    toFields(definition)
                        .map(([key, FieldT]) => given((
                            value = values[key]) =>
                            [
                                key,
                                type.satisfies(FieldT, values[key]) ?
                                    value :
                                    fail.type(typecheck(
                                        definition.name,
                                        key,
                                        type.name(FieldT),
                                        value))
                            ]))))
        
        
        toFields(definition)
        const receiver = new constructor();
        const fields = ;
        
        for (const [key FieldT] of fields)
        {
            const value = values[key];
    
            if (!type.statisfies(FieldT, value))
                fail();
    
            receiver[key] = value;
        }
    }
});







Type.Expression.Data = Type.Expression `Data` (
    (name, fFields) => ({ name, fFields }),
    (criterion, candidate) => false,
    function (NominalT, definition, args)
    {
        const values = args.length <= 0 ? EmptyArguments : args[0];

        return  values instanceof NominalT ? values :
                !(this instanceof NominalT) ? new NominalT(...args) :
                Object.assign(
                    this,
                    Object.fromEntries(
                    toFields(definition)
                        .map(([key, FieldT]) => given((
                            value = values[key]) =>
                            [
                                key,
                                type.satisfies(FieldT, values[key]) ?
                                    value :
                                    fail.type(typecheck(
                                        definition.name,
                                        key,
                                        type.name(FieldT),
                                        value))
                            ]))));
    });

const data = ()


function ()

Type.Expression.Data = Type.Expression `Data` (
    (name, fFields) => ({ name, fFields }),
    (criterion, candidate) => false,
    function (NominalT, definition, args)
    {
        const values = args.length <= 0 ? EmptyArguments : args[0];

        return  values instanceof NominalT ? values :
                !(this instanceof NominalT) ? new NominalT(...args) :
                Object.assign(
                    this,
                    Object.fromEntries(
                    toFields(definition)
                        .map(([key, FieldT]) => given((
                            value = values[key]) =>
                            [
                                key,
                                type.satisfies(FieldT, values[key]) ?
                                    value :
                                    fail.type(typecheck(
                                        definition.name,
                                        key,
                                        type.name(FieldT),
                                        value))
                            ]))));
    });