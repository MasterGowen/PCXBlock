var ind = 0;
var Arc = function (center, start, end) {
    this.id = ind++;
    this.Center = center;
    this.IsCircle = false;
    this.Start = start;
    this.End = end;
    this.Selected = false;
    window.updated = true;
};
Arc.prototype = {
    constructor: Arc,
    type: "arc"
};