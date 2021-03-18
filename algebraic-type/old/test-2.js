const type = require("./type");

const getTypeChain = value => getFunctionNameChain(value["Provenance"]);

const getFunctionNameChain = provenance =>
    provenance ? [provenance.function.name, ...getFunctionNameChain(provenance.parent)] : []


const Person = type `Person` ({ name: of => type.string });
const VIP = type (function VIP(stuff){ return Person(stuff) });

console.log(VIP({name:"Francisco"}));

console.log(getTypeChain(VIP({name:"Francisco"})));

console.log("----");

const id = type (function id(T) { return T });
const idVIP = id(VIP);


console.log(idVIP);
console.log(idVIP({name:"Francisco"}));
console.log(getTypeChain(idVIP({name:"Francisco"})));
