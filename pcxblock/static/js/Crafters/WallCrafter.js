var WallCrafter = function () {
    this.PrecisionMode = false;
    this.WallMode = false;
    this.BentMode = true;
    this.LineMode = false;
    this.BezierMode = false;
    this.ResultMode = false;
    this.PlotMode = false;
    this.GridMode = true;
    this.PaintMode = "WallMode";
    SimpleCrafter.call(this);
};
WallCrafter.prototype = new SimpleCrafter();
WallCrafter.prototype.SetPaintMode = function (flag) {
    this.WallMode = false;
    this.BezierMode = false;
    this.LineMode = false;
    this.BentMode = false;
    this.PaintMode = flag;
    delete this.startPoint;
};
WallCrafter.prototype.SetBentMode = function () {
    this.SetPaintMode("BentMode");
    this.BentMode = true;
    delete this.startPoint;
};
WallCrafter.prototype.SetWallMode = function () {
    this.SetPaintMode("WallMode");
    this.WallMode = true;
    delete this.startPoint;
};
WallCrafter.prototype.SetBezierMode = function () {
    this.SetPaintMode("BezierMode");
    this.BezierMode = true;
    delete this.startPoint;
};
WallCrafter.prototype.SetLineMode = function () {
    this.SetPaintMode("LineMode");
    this.LineMode = true;
    delete this.startPoint;
};
WallCrafter.prototype.SetPlotMode = function (flag) {
    this.PlotMode = flag;
    delete this.startPoint;
};
WallCrafter.prototype.SetResultMode = function (flag) {
    this.ResultMode = flag;
    this.GridMode = false;
};
WallCrafter.prototype.SetGridMode = function (flag) {
    this.GridMode = flag;
};
WallCrafter.prototype.GetGridMode = function () {
    return this.GridMode;
};
SimpleCrafter.prototype.KeyDown = function (key) {
    //undo
    if (key == 27) {
        element.World.undo();
        document.body.style.cursor = 'default';
        element.World.UpdateCycles();
        delete this.startPoint;
        delete this.tmpWall;
        delete this.tmpWalls;
    }
    if (key == 18)
        this.PrecisionMode = true;
};
SimpleCrafter.prototype.KeyUp = function (key) {
    if (key == 18)
        this.PrecisionMode = false;
    if (key == 16)
        this.WallMode = false;
};

WallCrafter.prototype.MouseDown = function (pnt) {
    document.body.style.cursor = 'default';
    delete this.tmpWall;
    delete this.tmpWalls;
    if (typeof this.startPoint !== "undefined") {
        if (this.WallMode) {
            element.World.UpdateCycles();
            delete this.startPoint;
        } 
        if (this.LineMode) {
                element.World.UpdateCycles();
                delete this.startPoint;
                return;
        }
        if (this.BezierMode) {
            element.World.UpdateCycles();
            delete this.startPoint;
            return;
        }
        }  
    this.startPoint = this.ProcessPoint(pnt);
};
WallCrafter.prototype.DblClick = function () {
    document.body.style.cursor = 'default';
    element.World.UpdateCycles();
    delete this.startPoint;
    delete this.tmpWall;
    delete this.tmpWalls;
};
WallCrafter.prototype.ProcessPoint = function (pnt) {
    if (this.PrecisionMode)
        return pnt;
    var sizeCell = new Drawer().CellSize;
    pnt = new Pnt(Math.round(pnt.X / sizeCell) * sizeCell, Math.round(pnt.Y / sizeCell) * sizeCell);
    var normPnt;
    if (typeof this.startPoint !== "undefined") {
       var len = Math.round(this.startPoint.length(pnt) / 10) * 10;
		var ang = this.startPoint.AngleTo(pnt);
		if (!this.WallMode)
//			ang = Math.round(this.startPoint.AngleTo(pnt) / Math.PI * 180 / 15) * 15 / 180 * Math.PI; // перевод в радианы и округление до 0, 45, 90, 135, 180, 225, 270, 315, 360
			ang = Math.round(this.startPoint.AngleTo(pnt) / Math.PI * 180 )  / 180 * Math.PI; 
		var norma = new Pnt(this.startPoint.X + len * Math.cos(ang), this.startPoint.Y + len * Math.sin(ang));
		normPnt = new Pnt(Math.round(norma.X / sizeCell) * sizeCell, Math.round(norma.Y / sizeCell) * sizeCell);
    }
    
    if (this.LineMode) return normPnt || pnt;
    
    if (this.BezierMode) {
        return normPnt || pnt;
    }
        
    var $this = this;
    var near = element.World.Objects.Walls.filter(function (e) { return e.Start.length(pnt) < sizeCell/2 || e.End.length(pnt) < sizeCell/2; });
    if (near.length > 0)
        return near[0].Start.length(pnt) < sizeCell/2 ? near[0].Start : near[0].End;
    else {
        // проверка есть ли уже эта линия среди нарисованных
        var onLine = element.World.Objects.Walls.map(function (e) {
            var eps = sizeCell;
            normPnt = normPnt || pnt;
            if ((Math.min(e.Start.X, e.End.X) - eps) >= normPnt.X || (Math.max(e.Start.X, e.End.X) + eps) <= normPnt.X)
                return undefined;
            if ((Math.min(e.Start.Y, e.End.Y) - eps) >= normPnt.Y || (Math.max(e.Start.Y, e.End.Y) + eps) <= normPnt.Y)
                return undefined;
            
            var alpha = (e.End.Y - e.Start.Y) / (e.End.X - e.Start.X);
            if (alpha === 0) {// если на оси X лежит
                return pnt.GetNearest(new Pnt(pnt.X, e.End.Y), new Pnt(normPnt.X, e.End.Y));
            }
            if (Math.abs(alpha) === Infinity) {// если на оси Y лежит
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
        }).filter(function (a) { return typeof a !== "undefined"; });
        if (onLine.length > 0)
            return pnt.GetNearest(onLine);
    }

    return normPnt || pnt;
};
WallCrafter.prototype.MouseMove = function (pnt) {
    element.World.Drawer2D.mouse = pnt;
    pnt = this.ProcessPoint(pnt);
    if (typeof this.startPoint !== "undefined" && (this.startPoint.X != pnt.X || this.startPoint.Y != pnt.Y)) {
        document.body.style.cursor = 'crosshair';
        if (!this.WallMode) {
            if (typeof this.tmpWalls !== "undefined") {
                element.World.undo();
                delete this.tmpWalls;
            }
            
            if (this.BezierMode) {
                //todo: необходимо дать возможность выделить контрольные точки
            }


            if (typeof this.tmpWall === "undefined") {
                this.tmpWall = new Wall(this.startPoint, pnt);
                
                element.World.UndoedEvents = [];
                element.World.UndoedEvents.push({
                    obj: this.tmpWall,
                    redo: function () {
                        if (element.World.Crafter.LineMode) element.World.Objects.Normals.push(this.obj);
                        if (element.World.Crafter.WallMode || element.World.Crafter.BentMode) element.World.Objects.Walls.push(this.obj);
                        if (element.World.Crafter.BezierMode) element.World.Objects.Beziers.push(this.obj);
                        element.World.Draw();
                    },
                    undo: function () {
                        if (element.World.Crafter.WallMode || element.World.Crafter.BentMode) 
                            for (var i in element.World.Objects.Walls) {
                                if (element.World.Objects.Walls[i] === this.obj)
                                    delete element.World.Objects.Walls[i];
                            }
                        if (element.World.Crafter.LineMode)
                            for (var i in element.World.Objects.Normals) {
                                if (element.World.Objects.Normals[i] === this.obj)
                                    delete element.World.Objects.Normals[i];
                            }
                        if (element.World.Crafter.BezierMode)
                            for (var i in element.World.Objects.Beziers) {
                                if (element.World.Objects.Beziers[i] === this.obj)
                                    delete element.World.Objects.Beziers[i];
                        }
                        element.World.Draw();
                    }
                });
                element.World.redo();

            } else {
                this.tmpWall.End = pnt;
//                element.World.Drawer2D.Message = Math.round(this.tmpWall.End.length(this.tmpWall.Start)) / 100 + "м";
            }
        } else {
            if (typeof this.tmpWall !== "undefined") {
                element.World.undo();
                delete this.tmpWall;
            }
            if (typeof this.tmpWalls === "undefined") {
                this.tmpWalls = [
                    new Wall(this.startPoint, new Pnt(this.startPoint.X, pnt.Y)),
                    new Wall(new Pnt(this.startPoint.X, pnt.Y), pnt),
                    new Wall(pnt, new Pnt(pnt.X, this.startPoint.Y)),
                    new Wall(new Pnt(pnt.X, this.startPoint.Y), this.startPoint)];
                element.World.UndoedEvents = [];
                element.World.UndoedEvents.push({
                    obj: this.tmpWalls,
                    redo: function() {
                        this.obj.forEach(function(e) {
                            element.World.Objects.Walls.push(e);
                        });
                        element.World.Draw();
                    },
                    undo: function() {
                        this.obj.forEach(function(e) {
                            delete element.World.Objects.Walls[element.World.Objects.Walls.indexOf(e)];
                        });
                        element.World.Draw();
                    }
                });
                element.World.redo();
            } else {
                this.tmpWalls[0].End = new Pnt(this.startPoint.X, pnt.Y);
                this.tmpWalls[1].Start = new Pnt(this.startPoint.X, pnt.Y);
                this.tmpWalls[1].End = pnt;
                this.tmpWalls[2].Start = pnt;
                this.tmpWalls[2].End = new Pnt(pnt.X, this.startPoint.Y);
                this.tmpWalls[3].Start = new Pnt(pnt.X, this.startPoint.Y);
//                element.World.Drawer2D.Message = Math.round(this.tmpWalls[0].End.length(this.tmpWalls[0].Start)) / 100 + " x "+Math.round(this.tmpWalls[1].End.length(this.tmpWalls[1].Start)) / 100+" м";
            }
        }
        element.World.Draw();
    } else {
        delete element.World.Drawer2D.Message;
    }
};