var Drawer = function () {
    this.Offset = new Pnt();
    this.MaxOffset = new Pnt();
    this.MinOffset = new Pnt();
    this.Scale = 1;
    this.OffsetStep = 50;
    this.MinScale = 1;
    this.CellSize = 2;
    this.FullScreen = 0;
};
Drawer.prototype = {
    Draw: function (objs) {
        var $this = this;
        objs.filter(function(obj) {
            return obj.type === "wall";
        }).forEach(function(obj) {
            $this.DrawWall(obj);
        });
        objs.filter(function (obj) {
            return obj.type === "wallpaper";
        }).forEach(function (obj) {
            $this.DrawWallPaper(obj);
        });
    },
    DrawFloor: function (objects, canvas, proc, additionalDrawing, angle) {
        angle = angle || 0;
        var areas = objects.Areas;
        for (var i in areas) {
            this.DrawOneFloor(areas[i], canvas, proc, additionalDrawing, angle);
        }

    },
    DrawOneFloor: function (o, can, proc, additionalDrawing, angle) {
        var ctx = can.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.save();
        ctx.beginPath();
        var ar = o;//createPath(o);
        var last = proc(ar[0]);
        ctx.moveTo(last.X, last.Y);
        var j;
        for (j in ar) {
            last = proc(ar[j]);
            ctx.lineTo(last.X, last.Y);
        }
        var minMax = GetMaxAndMinArr(o);
        ctx.stroke();
        ctx.clip();
        var tmpProc = proc;
        proc = function (point) {
            return tmpProc(minMax.min.add(point));
        };
        var w = minMax.max.X - minMax.min.X, h = minMax.max.Y - minMax.min.Y;
        ctx.save();
        var c0 = proc(new Pnt());
        var c1 = proc(new Pnt(w, 0));
        var c2 = proc(new Pnt(w, h));
        var c3 = proc(new Pnt(0, h));
        ctx.beginPath();
        ctx.moveTo(c0.X, c0.Y);
        ctx.lineTo(c1.X, c1.Y);
        ctx.lineTo(c2.X, c2.Y);
        ctx.lineTo(c3.X, c3.Y);
        ctx.lineTo(c0.X, c0.Y);
        ctx.fillStyle = '#eeeeee';
        ctx.fill();
        if (typeof o.fill === "undefined")
            o.fill = { objs: [] };
        //DrawOnCanvasByConfig(can, o);
        if (typeof o.fill !== "undefined")
        for (j in o.fill.objs) {
            var ob = o.fill.objs[j];
            new ImageLoader().GetImage(ob.image, function (img) {
                ctx.save();
                var canv = document.createElement('canvas');
                var c = proc(ob.Pnt);
                var ww = proc(ob.Pnt.add(new Pnt(img.width, img.height)));
                ctx.translate(c.X, c.Y);
                ctx.rotate(ob.Angle);
                if (angle != 0) {
                    var cctx = canv.getContext('2d');
                    canv.height = img.width;
                    canv.width = img.height;
                    //cctx.rotate(-angle);
                    cctx.drawImage(img, 0, 0, img.height, img.width);
                    ctx.drawImage(canv, 0, 0, ww.X - c.X, ww.Y - c.Y);
                } else 
                    ctx.drawImage(img, 0, 0, ww.X - c.X, ww.Y - c.Y);
                ctx.restore();
            });
        }
        if (typeof additionalDrawing === "function")
            additionalDrawing(ctx, proc,w,h);
        ctx.restore();
        ctx.restore();
    },
    GetCells: function (wid, hei, ww, hh, angle) {
        var w = ww, h = hh;
        var res = [];
        var analized = [];
        var toAnalyze = [new Pnt(0, 0)];
        var cos = Math.cos(angle), sin = Math.sin(angle);
        
        var isIn = function(p) {
            var pnts = [
                p,
                new Pnt(p.X - h * sin, p.Y + h * cos),
                new Pnt(p.X + h * sin, p.Y + h * cos),
                new Pnt(p.X + h * sin, p.Y - h * cos),
                new Pnt(p.X - h * sin, p.Y - h * cos),
                new Pnt(p.X + w * cos, p.Y + w * sin),
                new Pnt(p.X + w * cos, p.Y - w * sin),
                new Pnt(p.X - w * cos, p.Y + w * sin),
                new Pnt(p.X - w * cos, p.Y - w * sin),
                new Pnt(p.X + w * cos + h * sin, p.Y + w * sin + h * cos),
                new Pnt(p.X - w * cos + h * sin, p.Y + w * sin + h * cos),
                new Pnt(p.X + w * cos - h * sin, p.Y + w * sin + h * cos),
                new Pnt(p.X - w * cos - h * sin, p.Y + w * sin + h * cos),
                new Pnt(p.X + w * cos + h * sin, p.Y - w * sin + h * cos),
                new Pnt(p.X - w * cos + h * sin, p.Y - w * sin + h * cos),
                new Pnt(p.X + w * cos - h * sin, p.Y - w * sin + h * cos),
                new Pnt(p.X - w * cos - h * sin, p.Y - w * sin + h * cos),
                new Pnt(p.X + w * cos + h * sin, p.Y - w * sin - h * cos),
                new Pnt(p.X - w * cos + h * sin, p.Y - w * sin - h * cos),
                new Pnt(p.X + w * cos - h * sin, p.Y - w * sin - h * cos),
                new Pnt(p.X - w * cos - h * sin, p.Y - w * sin - h * cos)
            ];
            return pnts.some(function(b) { return b.X >= 0 && b.X <= wid && b.Y >= 0 && b.Y <= hei; });
        };
        var getNeighborhoods = function(p) {
            return [
                new Pnt(p.X - h * sin, p.Y + h * cos),
                new Pnt(p.X + w * cos, p.Y + w * sin),
                new Pnt(p.X + h * sin, p.Y - h * cos),
                new Pnt(p.X - w * cos, p.Y - w * sin)
            ];
        };
        var hash = function(p) {
            return Math.round(p.X) + " " + Math.round(p.Y);
        };
        while (toAnalyze.length > 0) {
            var pnt = toAnalyze.pop();
            if (isIn(pnt)) {
                if (res.filter(function (a) { return hash(a) === hash(pnt); }).length > 0) continue;
                pnt.Geometry = [
                    pnt,
                    new Pnt(pnt.X + w * cos, pnt.Y + w * sin),
                    new Pnt(pnt.X - h * sin + w * cos, pnt.Y + h * cos + w * sin),
                    new Pnt(pnt.X - h * sin, pnt.Y + h * cos),
                    //new Pnt(pnt.X - w * cos - h * sin, pnt.Y - w * sin - h * cos),
                    //new Pnt(pnt.X - h * sin, pnt.Y - h * cos),
                ];
                res.push(pnt);
                var neighs = getNeighborhoods(pnt);
                neighs.forEach(function(a) {
                    if (typeof analized[hash(a)] === "undefined") {
                        toAnalyze.push(a);
                        analized[hash(a)] = 1;
                    }
                });
            }
        }
        return res;
    },
    DrawLine: function (angle, ctx, proc, hh, w, h) {
        while (angle > (Math.PI / 2)) {
            angle -= Math.PI;
        }
        while (angle < (- Math.PI/2)) {
            angle += (Math.PI-0);
        }
        var an = Math.tan(angle);
        var anCos = Math.cos(angle);
        var anSin = Math.sin(angle);
        ctx.strokeStyle = "000";
        var i, p, p1;
        var dx = Math.abs(hh / anSin);
        var dy = Math.abs(hh / anCos);
        var func = function(x, b) {
            return an * x + b;
        };
        for (i = 0; i < w; i += dx) {
            ctx.beginPath();
            p = proc(new Pnt(i, func(i)));
            p1 = proc(new Pnt(h/an+i, h));
            ctx.moveTo(p.X, p.Y);
            ctx.lineTo(p1.X, p1.Y);
            ctx.stroke();
            ctx.beginPath();
            var tmpX = Math.round((i - h / an)/dx)*dx;
            p = proc(new Pnt(h/an+tmpX, h));
            p1 = proc(new Pnt(tmpX, 0));
            ctx.moveTo(p.X, p.Y);
            ctx.lineTo(p1.X, p1.Y);
            ctx.stroke();
        }
        for (i = 0; i < h; i += dy) {
            ctx.beginPath();
            var ddx = Math.abs((h - i) / an - Math.round((h - i) / an / dx) * dx);
            p = proc(new Pnt(-ddx, -ddx* an + i));
            p1 = proc(new Pnt(w+dx-ddx, (w+dx-ddx)*an+i));
            ctx.moveTo(p.X, p.Y);
            ctx.lineTo(p1.X, p1.Y);
            ctx.stroke();
            
            ctx.beginPath();
            p = proc(new Pnt(w+ddx, an*(w+ddx)+w*an-i));
            p1 = proc(new Pnt(0, i-an*w));
            ctx.moveTo(p.X, p.Y);
            ctx.lineTo(p1.X, p1.Y);
            ctx.stroke();
        }
        //if (angle > 0) {
        //    for (i = 0; i < h + w * an; i += hh / anCos) {
        //        ctx.beginPath();
        //        p = proc(new Pnt(0, i));
        //        p1 = proc(new Pnt(i / an, 0));
        //        ctx.moveTo(p.X, p.Y);
        //        ctx.lineTo(p1.X, p1.Y);
        //        ctx.stroke();
        //    }
        //}
        //if (angle < 0) {
        //    for (i = h / an; i <= w; i += hh / anCos) {
        //        ctx.beginPath();
        //        p = proc(new Pnt(i, 0));
        //        p1 = proc(new Pnt(i-h*an, h));
        //        ctx.moveTo(p.X, p.Y);
        //        ctx.lineTo(p1.X, p1.Y);
        //        ctx.stroke();
        //    }
        //}
    },
    DrawWall : function(obj) {
    },
    DrawWallPaper : function(obj) {
    },
    Start: function() {
    },
    End: function() {
    }
};