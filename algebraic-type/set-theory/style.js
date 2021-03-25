const { inspect } = require("util");


const style = (style, string) => []
    .concat(style)
    .map(style =>
        inspect.styles[style] ?
        inspect.colors[inspect.styles[style]] :
        inspect.colors[style])
    .reduce((string, [start, end]) =>
        `\u001b[${start}m${string}\u001b[${end}m`,
        string);
    
module.exports = style;

style.x = style("italic", "x"); // 𝑥
style.variable = name => style("italic", name);
