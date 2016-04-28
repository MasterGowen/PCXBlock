var ind = 0;
var Arc = function (center, start, end) {
    this.id = ind++;
    this.Center = center;
    this.IsCircle = false;
    this.Start = start;
    this.End = end;
    this.Width = window.Config.Wall.width;
    this.Height = window.Config.Wall.height;
    this.Config = { Left: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } }, Right: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } } };
    window.updated = true;
};
Arc.prototype = {
    constructor: Arc,
    type: "arc"
};