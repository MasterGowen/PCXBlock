var Move2DCrafter = function () {
    this.PrecisionMode = false;
    this.WallMode = false;
    SimpleCrafter.call(this);
	this.moving = [];
};
Move2DCrafter.prototype = new SimpleCrafter();
Move2DCrafter.prototype.KeyDown = function (key) {
};
Move2DCrafter.prototype.KeyUp = function (key) {
};
Move2DCrafter.prototype.MouseDown = function (pnt) {
    document.body.style.cursor = 'default';
	var $this = this;
	if (this.moving.length == 0) {
		window.World.Objects.Walls.forEach(function (a) {
			if (a.Start.length(pnt) < 10)
				$this.moving.push({move: function(b){ a.Start = b}});
			if (a.End.length(pnt) < 10)
				$this.moving.push({move: function(b){ a.End = b}});
		});
		window.World.Objects.Areas.forEach(function (a) {
			for (var i = 0; i < a.length; ++i){
				var b = a[i];
				if (b.length(pnt) < 10)
					$this.moving.push({move: function(b, j){ a[j] = b}, param: i});
			}
		});
	} else {
		this.moving = [];
	}
};
Move2DCrafter.prototype.DblClick = function () {
    document.body.style.cursor = 'default';
};
Move2DCrafter.prototype.ProcessPoint = function (pnt) {
    if (this.PrecisionMode)
        return pnt;
    pnt = new Pnt(Math.round(pnt.X / 10) * 10, Math.round(pnt.Y / 10) * 10);
    var $this = this;
    var near = window.World.Objects.Walls.filter(function(e) { return e.Start.length(pnt) < 10 || e.End.length(pnt) < 10; });
    if (near.length > 0)
        return near[0].Start.length(pnt) < 10 ? near[0].Start : near[0].End;
    else {
        var onLine = window.World.Objects.Walls.map(function (e) {
            var eps = 10;
            normPnt = pnt;
            if ((Math.min(e.Start.X, e.End.X) - eps) > pnt.X || (Math.max(e.Start.X, e.End.X) + eps) < pnt.X)
                return undefined;
            if ((Math.min(e.Start.Y, e.End.Y) - eps)> pnt.Y || (Math.max(e.Start.Y, e.End.Y)+eps) < pnt.Y)
                return undefined;
            var alpha = (e.End.Y - e.Start.Y) / (e.End.X - e.Start.X);
            if (alpha === 0) {
                return pnt.GetNearest(new Pnt(pnt.X, e.End.Y), new Pnt(normPnt.X, e.End.Y));
            }
            if (Math.abs(alpha) === Infinity) {
                var ar = [new Pnt(e.End.X, pnt.Y), new Pnt(e.End.X, normPnt.Y)];
                if (typeof $this.startPoint !== "undefined") {
                    ar.push(new Pnt(e.End.X, $this.startPoint.Y));
                }
                return pnt.GetNearest(ar);
            }
            var b = e.End.Y - e.End.X * alpha;
            if (Math.abs(alpha * pnt.X + b - pnt.Y) < 20) {
                return pnt.GetNearest(new Pnt(pnt.X, alpha * pnt.X + b), new Pnt((pnt.Y - b) / alpha, pnt.Y), normPnt, new Pnt(normPnt.X, alpha * normPnt.X + b), new Pnt((normPnt.Y - b) / alpha, normPnt.Y));
            }
            return undefined;
        }).filter(function(a) { return typeof a !== "undefined"; });
        if (onLine.length > 0)
            return pnt.GetNearest(onLine);
    }
    return pnt;
};
Move2DCrafter.prototype.MouseMove = function (pnt) {
    window.World.Drawer2D.mouse = pnt;
    pnt = this.ProcessPoint(pnt);
	if (this.moving && this.moving.length > 0)
		this.moving.forEach(function(a) {
			a.move(pnt, a.param);
		});
	else
	if (window.World.leftMouse) {
        if (typeof this.last !== "undefined") {
            var sub = pnt.sub(this.last);
            if (sub.length() < 30) {
                window.World.Drawer2D.Offset = window.World.Drawer2D.Offset.sub(sub);
            }
        }
        this.last = pnt;
    }
	
};