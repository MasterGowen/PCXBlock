var Drawer2D = function (container) {
    container.append("<canvas mode='2d'></canvas>");
    var canvas2D = $('canvas[mode=2d]', container)[0];
    canvas2D.width = container.width();
    canvas2D.height = container.height();
    canvas2D.container = container;
    this.canvas = canvas2D;
	var $this = this;
    Drawer.call(this);
	$(window).keydown(function (e) {
        if (window.World.Drawer !== $this) return;
        if (e.keyCode == 87 || e.keyCode == 38) {
            $this.MoveUp();
        }
        if (e.keyCode == 83|| e.keyCode == 40) {
            $this.MoveBottom();
        }
        if (e.keyCode == 65|| e.keyCode == 37) {
            $this.MoveLeft();
        }
        if (e.keyCode == 68|| e.keyCode == 39) {
            $this.MoveRight();
        }
	});
};
Drawer2D.prototype = new Drawer();
Drawer2D.prototype.GetWorldPoint = function(data) {
    return new Pnt(data.X * this.Scale + this.Offset.X, this.Scale * data.Y + this.Offset.Y);
};
Drawer2D.prototype.SetStepGrid = function (val) {
    if (val > 1 && val <= 100) {
        this.CellSize = val;
    }
};
Drawer2D.prototype.Draw = function (objects, currentColor) {
    this.Start();
	var $this = this;
	var toPnt = function (a) { return a.sub($this.Offset).mult(1 / $this.Scale); };
    // функция отрисовки точки
	var drawEllipse = function(obj, r, color) {
		var ctx = $this.canvas.getContext("2d");
		ctx.save();
		ctx.fillStyle = color;
		ctx.beginPath();
		var nPnt = toPnt(obj);
		ctx.arc(nPnt.X, nPnt.Y, r / $this.Scale, 0, 2 * Math.PI);
		ctx.fill();
		ctx.restore();
	};
	var msg = '';
	var canva = $this.canvas.getContext("2d");
	if (typeof $this.MessageAngle !== "undefined" && typeof $this.mouse !== "undefined" && window.World.Crafter.AngleMode) {
	    canva.font = "20px Arial";
	    msg = $this.MessageAngle;
	    canva.fillStyle = "rgba(0,0,0,1)";
	    canva.fillText(msg, ($this.mouse.X - $this.Offset.X) / $this.Scale, ($this.mouse.Y - $this.Offset.Y + 30) / $this.Scale);
	}
    // простые дуги и окружности
    objects.Arcs.concat(objects.TempArc).forEach(function (a) {
        if ($.isEmptyObject(a)) return;
        var ctx = $this.canvas.getContext("2d");
        ctx.save();
        ctx.beginPath();
        var col = currentColor || "rgba(255,182,0, 1)";
        a.Width = window.Config.Wall.width;
        if (window.World.Crafter.PlotMode && !window.World.Crafter.ResultMode) {
            switch (a.LineType) {
                case "dashdot": ctx.setLineDash([15, 5, 1, 5]); col = "rgba(0,0,0,1)"; break;
                case "main": col = "rgba(0,0,0,1)"; break;
                case "dashed": ctx.setLineDash([15, 5]); col = "rgba(0,0,0,1)"; break;
                case "thin": a.Width = 0.5; col = "rgba(0,0,0,1)"; break;
            }
        } else if (window.World.Crafter.ResultMode) {
            if (window.World.Crafter.MonoMode) col = "rgba(0,0,0,1)";
            else
            switch (a.LineType) {
                case "dashdot": col = "rgba(255,0,0,1)"; break;
                case "main": col = "rgba(0,255,0,1)"; break;
                case "dashed": col = "rgba(0,0,255,1)"; break;
                case "thin": col = "rgba(0,0,0,1)"; break;
            }
        }
        if (a.Selected) col = "rgba(255, 0, 0, 1)";
        if (!window.World.Crafter.ResultMode || (window.World.Crafter.ResultMode && a.LineType)) {
            var center = toPnt(a.Center), start = toPnt(a.Start), end = toPnt(a.End);
            var radius = center.length(start);
            //        var direction = (end.X - center.X) * (start.Y - center.Y) - (end.Y - center.Y) * (start.X - center.X);
            var startAngle = 0, endAngle = 2 * Math.PI;
            if (!a.IsCircle) {
                startAngle = Math.acos((start.X - center.X) / (center.length(start) + 1)), endAngle = Math.acos((end.X - center.X) / (center.length(end) + 1));
                if (start.Y < center.Y) {
                    startAngle = 2 * Math.PI - startAngle;
                }
                if (end.Y < center.Y) {
                    endAngle = 2 * Math.PI - endAngle;
                }
            }
            ctx.arc(center.X, center.Y, radius, startAngle, endAngle);
            ctx.strokeStyle = col;
            ctx.lineWidth = a.Width / $this.Scale;
            ctx.stroke();
            if (Math.abs(startAngle - endAngle) < 0.01) {
                ctx.closePath();
            }
            ctx.restore();
        }
    });
    // кривые Безье
    objects.Beziers.forEach(function (a) {
        var ctx = $this.canvas.getContext("2d");
        ctx.save();
        ctx.beginPath();
        var col = currentColor || "rgba(255,182,0, 1)";
        a.Width = window.Config.Wall.width;
        if (window.World.Crafter.PlotMode && !window.World.Crafter.ResultMode) {
            switch (a.LineType) {
                case "dashdot": ctx.setLineDash([15, 5, 1, 5]); col = "rgba(0,0,0,1)"; break;
                case "main": col = "rgba(0,0,0,1)"; break;
                case "dashed": ctx.setLineDash([15, 5]); col = "rgba(0,0,0,1)"; break;
                case "thin": a.Width = 0.5; col = "rgba(0,0,0,1)"; break;
            }
        } else if (window.World.Crafter.ResultMode) {
            if (window.World.Crafter.MonoMode) col = "rgba(0,0,0,1)";
            else
            switch (a.LineType) {
                case "dashdot": col = "rgba(255,0,0,1)"; break;
                case "main": col = "rgba(0,255,0,1)"; break;
                case "dashed": col = "rgba(0,0,255,1)"; break;
                case "thin": col = "rgba(0,0,0,1)"; break;
            }
        }
        if (a.Selected) col = "rgba(255, 0, 0, 1)";
        if (!window.World.Crafter.ResultMode || (window.World.Crafter.ResultMode && a.LineType)) {
                var start = toPnt(a.Start), cpoint1 = toPnt(a.FirstControlPoint), cpoint2 = toPnt(a.SecondControlPoint), end = toPnt(a.End);
                ctx.moveTo(start.X, start.Y);
                ctx.bezierCurveTo(cpoint1.X, cpoint1.Y, cpoint2.X, cpoint2.Y, end.X, end.Y);
                ctx.strokeStyle = col;
                ctx.lineWidth = a.Width / $this.Scale;
                ctx.stroke();
                ctx.restore();
        }
        if (!window.World.Crafter.ResultMode && !window.World.Crafter.PlotMode) {
            drawEllipse(a.Start, 1, currentColor || '#ED6C02');
            drawEllipse(a.End, 1, currentColor || '#ED6C02');
            drawEllipse(a.FirstControlPoint, 1, currentColor || 'rgba(255,182,0, 1)');
            drawEllipse(a.SecondControlPoint, 1, currentColor || 'rgba(255,182,0, 1)');
        }
    });
    // сглаженные прямые
    objects.Curves.forEach(function (a) {
        var ctx = $this.canvas.getContext("2d");
        ctx.save();
        ctx.beginPath();
        var col = currentColor || "rgba(255,182,0, 1)";
        a.Width = window.Config.Wall.width;
        if (window.World.Crafter.PlotMode && !window.World.Crafter.ResultMode) {
            switch (a.LineType) {
                case "dashdot": ctx.setLineDash([15, 5, 1, 5]); col = "rgba(0,0,0,1)"; break;
                case "main": col = "rgba(0,0,0,1)"; break;
                case "dashed": ctx.setLineDash([15, 5]); col = "rgba(0,0,0,1)"; break;
                case "thin": a.Width = 0.5; col = "rgba(0,0,0,1)"; break;
            }
        } else if (window.World.Crafter.ResultMode) {
            if (window.World.Crafter.MonoMode) col = "rgba(0,0,0,1)";
            else
            switch (a.LineType) {
                case "dashdot": col = "rgba(255,0,0,1)"; break;
                case "main": col = "rgba(0,255,0,1)"; break;
                case "dashed": col = "rgba(0,0,255,1)"; break;
                case "thin": col = "rgba(0,0,0,1)"; break;
            }
        }
        if (a.Selected) col = "rgba(255, 0, 0, 1)";
        var arr = [];
        if (!window.World.Crafter.ResultMode || (window.World.Crafter.ResultMode && a.LineType)) {
                a.Points.map(function(v) {
                    return toPnt(v);
                }).forEach(function(item) {
                    arr.push(item.X, item.Y);
                });
                ctx.drawCurve(arr);
                ctx.strokeStyle = col;
                ctx.lineWidth = a.Width / $this.Scale;
                ctx.stroke();
                ctx.restore();
            }
        if (!window.World.Crafter.ResultMode && !window.World.Crafter.PlotMode) {
            a.Points.forEach(function(item) {
                drawEllipse(item, 1, currentColor || '#ED6C02');
            });
        }
    });
    // ломанные, прямые и прямоугольники
    objects.Walls.concat(objects.Normals).forEach(function(a) {
		var ctx = $this.canvas.getContext("2d");
		ctx.save();
		ctx.beginPath();
		var last = toPnt(a.Start), $new = toPnt(a.End);
		var col = currentColor || "rgba(255,182,0, 1)";
		a.Width = window.Config.Wall.width;
		if (window.World.Crafter.PlotMode && !window.World.Crafter.ResultMode) {
		    switch (a.LineType) {
		        case "dashdot": ctx.setLineDash([15, 5, 1, 5]); col = "rgba(0,0,0,1)"; break;
		        case "main": col = "rgba(0,0,0,1)"; break;
		        case "dashed": ctx.setLineDash([15, 5]); col = "rgba(0,0,0,1)"; break;
		        case "thin": a.Width = 0.5; col = "rgba(0,0,0,1)"; break;
		    }
		} else if (window.World.Crafter.ResultMode) {
		    if (window.World.Crafter.MonoMode) col = "rgba(0,0,0,1)";
		    else
		    switch (a.LineType) {
		        case "dashdot": col = "rgba(255,0,0,1)"; break;
		        case "main": col = "rgba(0,255,0,1)"; break;
		        case "dashed": col = "rgba(0,0,255,1)"; break;
		        case "thin": col = "rgba(0,0,0,1)"; break;
		    }
		}
		if (a.Selected) col = "rgba(255, 0, 0, 1)";
		if (!window.World.Crafter.ResultMode || (window.World.Crafter.ResultMode && a.LineType)) {
                ctx.moveTo(last.X, last.Y);
                ctx.lineTo($new.X, $new.Y);
                ctx.strokeStyle = col;
                ctx.lineWidth = a.Width / $this.Scale;
                ctx.stroke();
                ctx.restore();
            }
		if (!window.World.Crafter.ResultMode && !window.World.Crafter.PlotMode) {
            drawEllipse(a.Start, 1, currentColor || '#ED6C02');
            drawEllipse(a.End, 1, currentColor || '#ED6C02');
            if (typeof $this.Message !== "undefined" && typeof $this.mouse !== "undefined" && window.World.Crafter.SizeMode) {
                ctx.font = "20px Arial";
                msg = $this.Message;
                ctx.fillStyle = "rgba(0,0,0,1)"; // text color
                ctx.fillText(msg, ($this.mouse.X - $this.Offset.X) / $this.Scale, ($this.mouse.Y - $this.Offset.Y - 10) / $this.Scale);
            }
        }
    });
    // линейка
    if (!$.isEmptyObject(objects.Ruler) && !window.World.Crafter.ResultMode) {
        canva.save();
        canva.beginPath();
        var lstart = toPnt(objects.Ruler.Start), lend = toPnt(objects.Ruler.End);
        canva.moveTo(lstart.X, lstart.Y);
        canva.lineTo(lend.X, lend.Y);
        canva.strokeStyle = "rgba(0,255,0, 1)";
        canva.lineWidth = 2 / $this.Scale;
        canva.stroke();
        canva.restore();
        if (typeof $this.Message !== "undefined" && typeof $this.mouse !== "undefined" /*&& window.World.Crafter.SizeMode*/) {
            canva.font = "20px Arial";
            msg = $this.Message;
            var mtrcs = canva.measureText(msg);
            canva.fillStyle = "rgba(0,0,0,1)"; // text color
            canva.fillText(msg, ($this.mouse.X - $this.Offset.X) / $this.Scale, ($this.mouse.Y - $this.Offset.Y - 10) / $this.Scale);
        }
    }
    // временная точка привязки
    if (!$.isEmptyObject(objects.TempLinkPoint) && !window.World.Crafter.ResultMode && !window.World.Crafter.PlotMode) {
        drawEllipse(objects.TempLinkPoint, 3, '#ED6C02');
    }
    // точки привязок
    objects.LinkPoints.forEach(function (a) {
        var col = '#ED6C02';
        if (window.World.Crafter.MonoMode) col = "rgba(0,0,0,1)";
        if (a.Selected) col = "rgba(255, 0, 0, 1)";
        drawEllipse(a.Point, 3, col);
    });
    if (window.World.Crafter.ResultMode) {
        var dataURL = $this.canvas.toDataURL();
        window.World.SavedResult = dataURL;
        this.DownloadCanvas(dataURL, 'result.png');
        window.World.Crafter.SetMonoMode(false);
        $this.canvas.width = $this.canvas.OldWidth;
        $this.canvas.height = $this.canvas.OldHeight;
        this.Scale = 1;
        window.World.Crafter.SetGridMode(true);
    }
    this.End();
};
Drawer2D.prototype.fullModeScreen = function (flag) {
    this.FullScreen = flag;
}
Drawer2D.prototype.reSizeCanvas = function() {
    var can = this.canvas;
    if (can.Imgwidth) {
        var k = can.Imgwidth / can.container.width();
        if (can.Imgheight / can.container.height() < k) k = can.Imgheight / can.container.height();
        window.World.Drawer.MinScale = k;
        window.World.Drawer.Scale = k;
        window.World.Drawer.Offset = new Pnt();
    }
}
Drawer2D.prototype.setImage = function (img) {
    var can = this.canvas;
    can.Image = img;
    $("<img/>") // Make in memory copy of image to avoid css issues
    .attr("src", $(img).attr("src"))
    .load(function () {
        can.Imgwidth = this.width;   
        can.Imgheight = this.height;
        var k = can.Imgwidth / can.container.width();
        if (can.Imgheight / can.container.height() < k) k = can.Imgheight / can.container.height();
        window.World.Drawer.MinScale = k;
        window.World.Drawer.Scale = k;
        window.World.Drawer.MinOffset = new Pnt(0, 0);
        window.World.Drawer.MaxOffset = new Pnt(can.Imgwidth, can.Imgheight);
    });
};
Drawer2D.prototype.setIdImage = function(id) {
    this.ImageId = parseInt(id);
};
Drawer2D.prototype.Start = function () {
    var can = this.canvas;
    if (window.World.Crafter.ResultMode) {
        can.OldWidth = can.container.width();
        can.OldHeight = can.container.height();
        can.width = can.Imgwidth;
        can.height = can.Imgheight;
        this.Scale = 1;
    }
    var ctx = can.getContext("2d");
    ctx.fillStyle = "#FEFEFE";
    ctx.fillRect(0, 0, can.width, can.height);
    if (window.World.Crafter.ResultMode) {
        this.Offset.X = 0;
        this.Offset.Y = 0;
    }
    if (can.Image && !window.World.Crafter.ResultMode) ctx.drawImage(can.Image, -this.Offset.X / this.Scale, -this.Offset.Y / this.Scale, can.Imgwidth / this.Scale, can.Imgheight / this.Scale);
    ctx.lineWidth = 0.1;
    // рисовалка сетки
    if (window.World.Crafter.GridMode) {
        var ix;
        for (var x = (-this.Offset.X % this.CellSize) / this.Scale; x < can.width; x += this.CellSize / this.Scale) {
            ix = Math.round(x * this.Scale / this.CellSize);
            var kx = Math.round((this.Offset.X + this.CellSize / this.Scale * ix) / this.CellSize);
            ctx.lineWidth = (kx % 5 == 0) ? 0.5 : 0.3;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, can.height);
            ctx.stroke();
        }
        for (var y = (-this.Offset.Y % this.CellSize) / this.Scale; y < can.height; y += this.CellSize / this.Scale) {
            ix = Math.round(y * this.Scale / this.CellSize);
            var ky = Math.round((this.Offset.Y + this.CellSize / this.Scale * ix) / this.CellSize);
            ctx.lineWidth = (ky % 5 == 0) ? 0.5 : 0.3;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(can.width, y);
            ctx.stroke();
        }
    } 
};
Drawer2D.prototype.DownloadCanvas = function (currDataURL, filename) {
    var link = document.createElement("a");
    link.href = currDataURL;
    link.download = filename;
    link.click();
};
Drawer2D.prototype.ScaleUp = function () {
    if (this.Scale >= this.MinScale) return;
    if (Math.abs(this.Scale - this.MinScale) <= 0.01) this.Scale = this.MinScale;
    else {
        this.Scale *= 1.1;
    }
    if (this.canvas.container.width() + this.Offset.X / this.Scale > (this.MaxOffset.X / this.Scale)) {
        if (this.MaxOffset.X - this.canvas.container.width() * this.Scale > this.MinOffset.X) {
            this.Offset.X = this.MaxOffset.X - this.canvas.container.width() * this.Scale;
        } else {
            this.Offset.X = this.MinOffset.X;
        }
    }
    if (this.canvas.container.height() + this.Offset.Y / this.Scale + this.OffsetStep * this.Scale > (this.MaxOffset.Y / this.Scale)) {
        if (this.MaxOffset.Y - this.canvas.container.height() * this.Scale > this.MinOffset.Y) {
            this.Offset.Y = this.MaxOffset.Y - this.canvas.container.height() * this.Scale;
        } else {
            this.Offset.Y = this.MinOffset.Y;
        }
    }
};
Drawer2D.prototype.ScaleDown = function () {
    if (this.Scale <= 0.05) return;
    this.Scale /= 1.1;
};
Drawer2D.prototype.MoveLeft = function () {
    if (this.Offset.X - this.OffsetStep * this.Scale <= this.MinOffset.X) {
        if (this.Offset.X > this.MinOffset.X) {
            this.Offset.X -= this.Offset.X - this.MinOffset.X;
        }
        return;
    }
    this.Offset.X -= this.OffsetStep * this.Scale;
};
Drawer2D.prototype.MoveRight = function () {
    var currentWidth = this.canvas.container.width() + this.Offset.X / this.Scale;
    if (currentWidth + this.OffsetStep * this.Scale >= (this.MaxOffset.X / this.Scale)) {
        if (this.MaxOffset.X / this.Scale > currentWidth) {
            this.Offset.X +=this.MaxOffset.X / this.Scale - currentWidth;
        }
        return;
    }
    this.Offset.X += this.OffsetStep * this.Scale;
};
Drawer2D.prototype.MoveUp = function () {
    if (this.Offset.Y - this.OffsetStep * this.Scale <= this.MinOffset.Y) {
        if (this.MinOffset.Y < this.Offset.Y) {
            this.Offset.Y -= this.Offset.Y - this.MinOffset.Y;
        }
        return;
    }
    this.Offset.Y -= this.OffsetStep * this.Scale;
};
Drawer2D.prototype.MoveBottom = function () {
    var currentHeight = this.canvas.container.height() + this.Offset.Y / this.Scale;
    if (currentHeight + this.OffsetStep * this.Scale >= (this.MaxOffset.Y / this.Scale)) {
        if (this.MaxOffset.Y / this.Scale > currentHeight) {
            this.Offset.Y += this.MaxOffset.Y / this.Scale-currentHeight;
        }
        return;
    }
    this.Offset.Y += this.OffsetStep * this.Scale;
};
// smooth line by points
if (CanvasRenderingContext2D != 'undefined') {
    CanvasRenderingContext2D.prototype.drawCurve =
        function (pts, tension, isClosed, numOfSegments, showPoints) {
            drawCurve(this, pts, tension, isClosed, numOfSegments, showPoints);
        };
}
function drawCurve(ctx, ptsa, tension, isClosed, numOfSegments, showPoints) {

    showPoints = showPoints ? showPoints : false;

    ctx.beginPath();

    drawLines(ctx, getCurvePoints(ptsa, tension, isClosed, numOfSegments));

    if (showPoints) {
        ctx.stroke();
        ctx.beginPath();
        for (var i = 0; i < ptsa.length - 1; i += 2)
            ctx.rect(ptsa[i] - 2, ptsa[i + 1] - 2, 4, 4);
    }
}
function getCurvePoints(pts, tension, isClosed, numOfSegments) {

    // use input value if provided, or use a default value   
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    isClosed = isClosed ? isClosed : false;
    numOfSegments = numOfSegments ? numOfSegments : 16;

    var _pts = [], res = [],    // clone array
        x, y,           // our x,y coords
        t1x, t2x, t1y, t2y, // tension vectors
        c1, c2, c3, c4,     // cardinal points
        st, t, i;       // steps based on num. of segments

    // clone array so we don't change the original
    //
    _pts = pts.slice(0);

    // The algorithm require a previous and next point to the actual point array.
    // Check if we will draw closed or open curve.
    // If closed, copy end points to beginning and first points to end
    // If open, duplicate first points to befinning, end points to end
    if (isClosed) {
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.push(pts[0]);
        _pts.push(pts[1]);
    }
    else {
        _pts.unshift(pts[1]);   //copy 1. point and insert at beginning
        _pts.unshift(pts[0]);
        _pts.push(pts[pts.length - 2]); //copy last point and append
        _pts.push(pts[pts.length - 1]);
    }

    // ok, lets start..

    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 pts + 1e point before and after
    for (i = 2; i < (_pts.length - 4) ; i += 2) {
        for (t = 0; t <= numOfSegments; t++) {

            // calc tension vectors
            t1x = (_pts[i + 2] - _pts[i - 2]) * tension;
            t2x = (_pts[i + 4] - _pts[i]) * tension;

            t1y = (_pts[i + 3] - _pts[i - 1]) * tension;
            t2y = (_pts[i + 5] - _pts[i + 1]) * tension;

            // calc step
            st = t / numOfSegments;

            // calc cardinals
            c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
            c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
            c4 = Math.pow(st, 3) - Math.pow(st, 2);

            // calc x and y cords with common control vectors
            x = c1 * _pts[i] + c2 * _pts[i + 2] + c3 * t1x + c4 * t2x;
            y = c1 * _pts[i + 1] + c2 * _pts[i + 3] + c3 * t1y + c4 * t2y;

            //store points in array
            res.push(x);
            res.push(y);

        }
    }

    return res;
}
function drawLines(ctx, pts) {
    ctx.moveTo(pts[0], pts[1]);
    for (i = 2; i < pts.length - 1; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
}
/*example
var myPoints = [10,10, 40,30, 100,10, 200, 100, 200, 50, 250, 120]; //minimum two points
var tension = 1;
drawCurve(ctx, myPoints); //default tension=0.5
drawCurve(ctx, myPoints, tension);
ctx.drawCurve(myPoints);
*/