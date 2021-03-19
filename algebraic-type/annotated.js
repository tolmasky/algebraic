const type = require("./type");

module.exports = function annotated(target, annotations)
{
    this.type = target instanceof type ? target : target.type;
    this.annotations = annotations;
}
