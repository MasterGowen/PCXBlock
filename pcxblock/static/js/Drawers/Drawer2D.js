var Drawer2D = function (container) {
    container.append("<canvas mode='2d'></canvas>");
    var canvas2D = $('canvas[mode=2d]', container)[0];
    canvas2D.width = container.width();
    canvas2D.height = container.height();
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
Drawer2D.prototype.Draw = function (objects, currentColor) {
    var objs = objects.Walls;
     if (objects.Line.length>0) var line = objects.Line[0];
    this.Start();
    var walls = objs.filter(function (a) { return a.type === "wall"; });
	var $this = this;
	var toPnt = function(a) {return a.sub($this.Offset).mult(1/$this.Scale);};
	var drawEllipse = function(obj, r, color) {
		var ctx = $this.canvas.getContext("2d");
		ctx.save();
		ctx.fillStyle = color;
		ctx.beginPath();
		var $new = toPnt(obj);
		ctx.arc($new.X, $new.Y, r/ $this.Scale, 0, 2*Math.PI);
		ctx.fill();
		ctx.restore();
	};
    
    if(typeof line !== "undefined") {
        var ctx = $this.canvas.getContext("2d");
        ctx.save();
        ctx.beginPath();
        var last = toPnt(line.Start), $new = toPnt(line.End);
        ctx.moveTo(last.X, last.Y);
        ctx.lineTo($new.X, $new.Y);
        var col = currentColor||"rgba(255,30,146, 1)";
        ctx.strokeStyle = col;
        ctx.lineWidth = line.Width / $this.Scale;
        ctx.stroke();
        ctx.restore();
        drawEllipse(line.Start, 1, currentColor || '#ED6C02');
        drawEllipse(line.End, 1, currentColor || '#ED6C02');
    }
    
    objects.Normals./*filter(function (n) {
        return n.CrossPoints.length == 2;
    }).*/forEach(function (a) {
            var ctxa = $this.canvas.getContext("2d");
            ctxa.save();
            ctxa.beginPath();
            var lasta = toPnt(a.CrossPoints[0]), $newa = toPnt(a.CrossPoints[1]);
            ctxa.moveTo(lasta.X, lasta.Y);
            ctxa.lineTo($newa.X, $newa.Y);
            var cola = currentColor || "rgba(0,101,173, 1)";
            ctxa.strokeStyle = cola;
            ctxa.lineWidth = window.Config.Wall.width/ $this.Scale/3;
            ctxa.stroke();
            ctxa.restore();
            drawEllipse(a.CrossPoints[0], 0.5, currentColor || '#FFE41E');
            drawEllipse(a.CrossPoints[1], 0.5, currentColor || '#FFE41E');
//        drawEllipse(a.Start, 2, '#FFE41E');
//        drawEllipse(a.End, 2, '#FF471E');
    });

    walls.forEach(function(a) {
		var ctx = $this.canvas.getContext("2d");
		ctx.save();
		ctx.beginPath();
		var last = toPnt(a.Start), $new = toPnt(a.End);
		ctx.moveTo(last.X, last.Y);
        ctx.lineTo($new.X, $new.Y);
        var col = currentColor || "rgba(255,182,0, 1)";
        if (typeof window.World.Crafter.walls !== 'undefined' && window.World.Crafter.walls.filter(function (d) { return d.Eq(a); }).length > 0)
            col = currentColor || "rgba(237, 108, 2, 1)";
		ctx.strokeStyle = col;
        ctx.lineWidth = a.Width / $this.Scale;
		ctx.stroke();
		ctx.restore();
		drawEllipse(a.Start, 1, currentColor || '#ED6C02');
		drawEllipse(a.End, 1, currentColor || '#ED6C02');
	});
    this.End();
};
Drawer2D.prototype.setImage = function (img) {
//    this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.Image = img;
    this.canvas.Imgwidth = 660;
    this.canvas.Imgheight = 495;
};
Drawer2D.prototype.setIdImage = function(id) {
    this.ImageId = parseInt(id);
};
Drawer2D.prototype.Start = function () {
    var can = this.canvas;
    var ctx = can.getContext("2d");
    ctx.fillStyle = "#FEFEFE";
    ctx.fillRect(0, 0, can.width, can.height);
    if (can.Image) ctx.drawImage(can.Image, -this.Offset.X / this.Scale, -this.Offset.Y / this.Scale, can.Imgwidth/this.Scale, can.Imgheight / this.Scale);
    ctx.lineWidth = 0.1;
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
        var ky = Math.round((this.Offset.Y + this.CellSize / this.Scale * ix)/ this.CellSize);
        ctx.lineWidth = (ky % 5 == 0) ? 0.5 : 0.3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(can.width, y);
        ctx.stroke();
    }
};
Drawer2D.prototype.ScaleUp = function () {
    if (this.Scale > 1.8) return;
    this.Scale *= 1.1;
};
Drawer2D.prototype.ScaleDown = function () {
    this.Scale /= 1.1;
};
Drawer2D.prototype.MoveLeft = function() {
    this.Offset.X -= 10 * this.Scale;
};
Drawer2D.prototype.MoveRight = function () {
    this.Offset.X += 10 * this.Scale;
};
Drawer2D.prototype.MoveUp = function () {
    this.Offset.Y -= 10 * this.Scale;
};
Drawer2D.prototype.MoveBottom = function () {
    this.Offset.Y += 10 * this.Scale;
};
Drawer2D.prototype.Calculate = function () {
    window.World.Objects.Normals = [];
    var line = window.World.Objects.Line[0];
    var k = (line.End.Y - line.Start.Y) / (line.End.X - line.Start.X);
    var b = -k * line.Start.X + line.Start.Y;
    var len = this.CellSize;
    var x = len / Math.sqrt(1 + k * k) + line.Start.X;
    var y = k * x + b;
    var start = new Pnt(x, y);
//    var normal = new Pnt(k, -1);
    var kn = -1 / k;
    var bn = -kn * x + y;
    var scrossPoints = [];
    var result = 0;
    window.World.Objects.Walls.filter(function(p) {
        //( (Y1-Y(X1)) * (Y2-Y(X2)) МЕНЬШЕ ЛИБО РАВНО 0
        return (p.Start.Y - (kn * p.Start.X + bn)) * (p.End.Y - (kn * p.End.X + bn)) <= 0;
    }).forEach(function(w) {
        var kw = (w.End.Y - w.Start.Y) / (w.End.X - w.Start.X);
        var bw = -kw * w.Start.X + w.Start.Y;
        var crossPoint = new Pnt();
        crossPoint.X = (bn - bw) / (kw - kn);
        crossPoint.Y = kn * crossPoint.X + bn;
        scrossPoints.push(crossPoint);
    });
    if (scrossPoints.length == 2) {
        window.World.Objects.Normals.push({ Start: start, CrossPoints: scrossPoints, Results: Math.round(Math.sqrt(Math.pow(scrossPoints[1].X - scrossPoints[0].X, 2) + Math.pow(scrossPoints[1].Y - scrossPoints[0].Y, 2)) * koeffpix *100)/100 });
        result += Math.round(Math.sqrt(Math.pow(scrossPoints[1].X - scrossPoints[0].X, 2) + Math.pow(scrossPoints[1].Y - scrossPoints[0].Y, 2)) * koeffpix * 100) / 100;
    }
    while (line.End.length(start) > 2*this.CellSize) {
        x = len / Math.sqrt(1 + k * k) + start.X;
        y = k * x + b;
        bn = -kn * x + y;
        start = new Pnt(x, y);
        var crossPoints = [];
        window.World.Objects.Walls.filter(function (p) {
            //( (Y1-Y(X1)) * (Y2-Y(X2)) МЕНЬШЕ ЛИБО РАВНО 0
            return (p.Start.Y - (kn * p.Start.X + bn)) * (p.End.Y - (kn * p.End.X + bn)) <= 0;
        }).forEach(function (w) {
            var kw = (w.End.Y - w.Start.Y) / (w.End.X - w.Start.X);
            var bw = -kw * w.Start.X + w.Start.Y;
            var crossPoint = new Pnt();
            crossPoint.X = (bn - bw) / (kw - kn);
            crossPoint.Y = kn * crossPoint.X + bn;
            crossPoints.push(crossPoint);
        });
        if (crossPoints.length == 2) {
            window.World.Objects.Normals.push({ Start: start, CrossPoints: crossPoints, Results: Math.round(Math.sqrt(Math.pow(crossPoints[1].X - crossPoints[0].X, 2) + Math.pow(crossPoints[1].Y - crossPoints[0].Y, 2)) * koeffpix * 100) / 100 });
            result += Math.round(Math.sqrt(Math.pow(crossPoints[1].X - crossPoints[0].X, 2) + Math.pow(crossPoints[1].Y - crossPoints[0].Y, 2)) * koeffpix * 100) / 100;
        }
    }
    return Math.round(result/window.World.Objects.Normals.length*1000)/1000;
};