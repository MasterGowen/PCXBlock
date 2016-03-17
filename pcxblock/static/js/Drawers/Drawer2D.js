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
    
    objects.Normals.forEach(function (a) {
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
    

    objects.Beziers.forEach(function (a) {
        var ctx = $this.canvas.getContext("2d");
        ctx.save();
        ctx.beginPath();
        var start = toPnt(a.Start), cpoint1 = toPnt(a.FirstControlPoint), cpoint2 = toPnt(a.SecondControlPoint), end = toPnt(a.End);
        ctx.moveTo(start.X, start.Y);
        ctx.bezierCurveTo(cpoint1.X, cpoint1.Y, cpoint2.X, cpoint2.Y, end.X, end.Y);
        var col = currentColor || "rgba(255,182,0, 1)";
        ctx.strokeStyle = col;
        ctx.lineWidth = a.Width / $this.Scale;
        ctx.stroke();
        ctx.restore();
        drawEllipse(a.Start, 1, currentColor || '#ED6C02');
        drawEllipse(a.End, 1, currentColor || '#ED6C02');
        drawEllipse(a.FirstControlPoint, 1, currentColor || 'rgba(255,182,0, 1)');
        drawEllipse(a.SecondControlPoint, 1, currentColor || 'rgba(255,182,0, 1)');
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
    if (window.World.Crafter.ResultMode) {
        var dataURL = $this.canvas.toDataURL();
        window.World.SavedResult = dataURL;
        //this.DownloadCanvas(dataURL, 'result.png');
        window.World.Crafter.SetResultMode(false);
        $this.canvas.width = $this.canvas.OldWidth;
        $this.canvas.height = $this.canvas.OldHeight;
        window.World.Crafter.SetGridMode(true);
    }
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

Drawer2D.prototype.ReDrawGrid = function () {
    var can = this.canvas;

    var ctx = can.getContext("2d");
    ctx.fillStyle = "#FD0000";
    ctx.fillRect(0, 0, can.width, can.height);
    if (can.Image && !window.World.Crafter.ResultMode) ctx.drawImage(can.Image, -this.Offset.X / this.Scale, -this.Offset.Y / this.Scale, can.Imgwidth / this.Scale, can.Imgheight / this.Scale);
    ctx.lineWidth = 0.1;

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
    this.Scale *= 1.1;
    if (this.canvas.container.width() + this.Offset.X / this.Scale > (this.MaxOffset.X / this.Scale)) {
        this.Offset.X = this.MaxOffset.X - this.canvas.container.width() * this.Scale;
    }
    if (this.canvas.container.height() + this.Offset.Y / this.Scale + 10 * this.Scale > (this.MaxOffset.Y / this.Scale)) {
        this.Offset.Y = this.MaxOffset.Y - this.canvas.container.height() * this.Scale;
    }
};
Drawer2D.prototype.ScaleDown = function () {
    if (this.Scale <= 0.05) return;
    this.Scale /= 1.1;
};
Drawer2D.prototype.MoveLeft = function () {
    if (this.Offset.X - 10 * this.Scale <= this.MinOffset.X) return;
    this.Offset.X -= 10 * this.Scale;
};
Drawer2D.prototype.MoveRight = function () {
    if (this.canvas.container.width() + this.Offset.X / this.Scale + 10 * this.Scale >= (this.MaxOffset.X / this.Scale)) return;
    this.Offset.X += 10 * this.Scale;
};
Drawer2D.prototype.MoveUp = function () {
    if (this.Offset.Y - 10 * this.Scale <= this.MinOffset.Y) return;
    this.Offset.Y -= 10 * this.Scale;
};
Drawer2D.prototype.MoveBottom = function () {
    if (this.canvas.container.height() + this.Offset.Y / this.Scale + 10 * this.Scale >= (this.MaxOffset.Y / this.Scale)) return;
    this.Offset.Y += 10 * this.Scale;
};
