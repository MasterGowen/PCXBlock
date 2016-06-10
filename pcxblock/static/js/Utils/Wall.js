var ind = 0;
var Wall = function (start, end) {
    this.id = ind++;
    this.Start = start;
    this.End = end;
//    this.Width = window.Config.Wall.width;
//    this.Height = window.Config.Wall.height;
//    this.Config = { Left: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } }, Right: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } } };
    this.Selected = false;
    window.updated = true;
};
Wall.prototype = {
    constructor: Wall,
    type : "wall"
};
Wall.prototype.IsOn = function(pnt) {
    var ch = function(one, two) {
        return Math.abs(one - two) < 1;
    };
    var minX = Math.min(this.Start.X, this.End.X);
    var minY = Math.min(this.Start.Y, this.End.Y);
    var maxX = Math.max(this.Start.X, this.End.X);
    var maxY = Math.max(this.Start.Y, this.End.Y);
    if (pnt.X < minX || pnt.X > maxX || pnt.Y < minY || pnt.Y > maxY) return false;
    if (maxX == minX)
        return ch(maxX, pnt.X);
    if (maxY == minY)
        return ch(maxY, pnt.Y);
    var alpha = (maxY - minY) / (maxX - minX);
    var b = this.End.Y - alpha * this.End.X;
    return ch(alpha*pnt.X + b, pnt.Y);
};
Wall.prototype.Eq = function(wall) {
	return this.Start.length(wall.Start) == 0 && this.End.length(wall.End) == 0;
};
