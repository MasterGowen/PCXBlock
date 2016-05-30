var ind = 0;
var LinkPoint = function (pnt) {
    this.id = ind++;
    this.Point = pnt;
    this.Selected = false;
    window.updated = true;
};
LinkPoint.prototype = {
    constructor: LinkPoint,
    type: "LinkPoint"
};