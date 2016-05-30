var ind = 0;
var BezierCurve = function (start, cpoint1, cpoint2, end, index) {
    this.id = ind++;
    this.Start = start;
    this.FirstControlPoint = cpoint1;
    this.SecondControlPoint = cpoint2;
    this.End = end;
    this.CurrentIndex = index;
    this.Selected = false;
    window.updated = true;
};
BezierCurve.prototype = {
    constructor: BezierCurve,
    type: "beziercurve"
};