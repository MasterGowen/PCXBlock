Pnt = function (x, y) {
    this.X = x || 0;
    this.Y = y || 0;
    return this;
};
Pnt.prototype = {
    constructor: Pnt,
    length: function (p1) {
        p1 = p1 || new Pnt();
        return Math.sqrt((p1.X - this.X) * (p1.X - this.X) + (p1.Y - this.Y) * (p1.Y - this.Y));
    },
    center: function (p1) {
        p1 = p1 || new Pnt();
        return new Pnt((p1.X + this.X) / 2, (p1.Y + this.Y) / 2);
    },
    ToVector3: function (z) {
        z = z || 0;
        return new THREE.Vector3(this.X, z, this.Y);
    },
    AngleBetween: function (a, b) {
        if (typeof a === "undefined" || typeof b === "undefined") return 0;
        var aa = new Pnt(this.X-a.X, this.Y-a.Y);
        var bb = new Pnt(this.X - b.X, this.Y - b.Y);
        var ang = Math.acos((aa.X * bb.X + aa.Y * bb.Y) / aa.length() / bb.length());
        return ang;
    },
    AngleTo: function (a) {
        if (typeof a === "undefined") return 0;
        return Math.atan2(a.Y - this.Y, a.X - this.X);
    },
    GetNearest: function () {
        var ind = -1;
        var min = Math.min();
        if (arguments[0] instanceof Array)
            arguments = arguments[0];
        for (var i = 0; i < arguments.length; ++i) {
            var r = this.length(arguments[i]);
            if (r < min) {
                min = r;
                ind = i;
            }
        }
        if (ind < 0) return undefined;
        return arguments[ind];
    },
    Normalize: function (size) {
        size = size | 50;
        return new Pnt(Math.round(this.X / size) * size, Math.round(this.Y / size) * size);
    },
    add: function (p) {
        if (typeof p === "undefined") return this;
        return new Pnt(this.X + p.X, this.Y + p.Y);
    },
    sub: function(p) {
        if (typeof p === "undefined") return this;
        return new Pnt(this.X - p.X, this.Y - p.Y);
    },
    mult: function(p) {
        if (typeof p === "undefined") return this;
        return new Pnt(this.X * p, this.Y * p);
    },
    transformToPolar: function (center) {
        center = center || new Pnt();
        var x = this.X - center.X, y = this.Y - center.Y;
        var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var alpha = Math.atan(y / x);
        if (y < 0) {
            alpha = 2 * Math.PI - alpha;
        }
        return new PolarPnt(r, alpha);
    },
};
PolarPnt = function (r, theta) {
    this.R = r || 0;
    this.Angle = theta || 0;
    return this;
};
PolarPnt.prototype = {
    constructor: PolarPnt,
};