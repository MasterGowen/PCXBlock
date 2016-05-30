var ind = 0;
var SmoothCurve = function (pnts) {
    this.id = ind++;
    this.Points = pnts;
    this.PntCount = 0;
    this.Selected = false;
    window.updated = true;
};
SmoothCurve.prototype = {
    constructor: SmoothCurve,
    type: "smoothcurve"
};