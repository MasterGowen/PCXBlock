var ind = 0;
var BezierCurve = function (start, cpoint1, cpoint2, end, index) {
    this.id = ind++;
    this.Start = start;
    this.FirstControlPoint = cpoint1;
    this.SecondControlPoint = cpoint2;
    this.End = end;
    this.CurrentIndex = index;
    this.Width = window.Config.Wall.width;
    this.Height = window.Config.Wall.height;
    this.Config = { Left: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } }, Right: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } } };
    window.updated = true;
};
BezierCurve.prototype = {
    constructor: BezierCurve,
    type: "beziercurve"
};