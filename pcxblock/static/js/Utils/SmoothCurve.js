var ind = 0;
var SmoothCurve = function (pnts) {
    this.id = ind++;
    this.Points = pnts;
    this.PntCount = 0;
    this.Width = window.Config.Wall.width;
    this.Height = window.Config.Wall.height;
    this.Config = { Left: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } }, Right: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } } };
    window.updated = true;
};
SmoothCurve.prototype = {
    constructor: SmoothCurve,
    type: "smoothcurve"
};