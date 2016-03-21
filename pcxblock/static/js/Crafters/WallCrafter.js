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
    this.LineType = "main";
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
WallCrafter.prototype.SetLineType = function (flag) {
    this.LineType = flag;
};
SimpleCrafter.prototype.KeyDown = function (key) {
    //undo
    if (!this.PlotMode) {
        if (key == 27) {
            window.World.undo();
            document.body.style.cursor = 'default';
            window.World.UpdateCycles();
            delete this.startPoint;
            delete this.tmpWall;
            delete this.tmpBezier;
            delete this.tmpWalls;
        }
        if (key == 18)
            this.PrecisionMode = true;
    }
};
SimpleCrafter.prototype.KeyUp = function (key) {
    if (!this.PlotMode) {
        if (key == 18)
            this.PrecisionMode = false;
        if (key == 16)
            this.WallMode = false;
    }
};

WallCrafter.prototype.MouseDown = function (pnt) {
    if (!this.PlotMode) {
        document.body.style.cursor = 'default';
        delete this.tmpWall;
        delete this.tmpWalls;
        if (typeof this.startPoint !== "undefined") {
            if (this.WallMode) {
                window.World.UpdateCycles();
                delete this.startPoint;
                return;
            }
            if (this.LineMode) {
                window.World.UpdateCycles();
                delete this.startPoint;
                return;
            }
            if (this.BezierMode) {
                window.World.UpdateCycles();
                delete this.startPoint;
                this.startPoint = this.ProcessPoint(pnt);
                switch (this.tmpBezier.CurrentIndex) {
                case 1:
                    this.tmpBezier.FirstControlPoint = this.tmpBezier.SecondControlPoint = this.tmpBezier.End = this.startPoint;
                    this.tmpBezier.CurrentIndex++;
                    break;
                case 2:
                    this.tmpBezier.SecondControlPoint = this.tmpBezier.End = this.startPoint;
                    this.tmpBezier.CurrentIndex++;
                    break;
                case 3:
                    this.tmpBezier.End = this.startPoint;
                    delete this.tmpBezier;
                    delete this.startPoint;
                    break;
                default:
                    delete this.tmpBezier;
                    delete this.startPoint;
                }
                return;
            }
        }
        this.startPoint = this.ProcessPoint(pnt);
    } else {
        var flag = false;
        window.World.Objects.Walls.forEach(function (a) {
            if (!flag) {
                //abs(sqrt(sqr(x1-x3)+sqr(y1-y3)) + sqrt(sqr(x2-x3)+sqr(y2-y3)) - sqrt(sqr(x2-x1)+sqr(y2-y1))) <0.01
                if (Math.abs(Math.sqrt(Math.pow(a.Start.X-pnt.X,2)+Math.pow(a.Start.Y-pnt.Y,2))+Math.sqrt(Math.pow(a.End.X - pnt.X,2)+Math.pow(a.End.Y - pnt.Y,2))-Math.sqrt(Math.pow(a.End.X - a.Start.X,2)+Math.pow(a.End.Y - a.Start.Y,2)))<0.15){
                    a.LineType = window.World.Crafter.LineType;
                    flag = true;
                }
            }
        });
        if (!flag) {
            window.World.Objects.Normals.forEach(function (a) {
                if (!flag) {
                    if (Math.abs(Math.sqrt(Math.pow(a.Start.X - pnt.X, 2) + Math.pow(a.Start.Y - pnt.Y, 2)) + Math.sqrt(Math.pow(a.End.X - pnt.X, 2) + Math.pow(a.End.Y - pnt.Y, 2)) - Math.sqrt(Math.pow(a.End.X - a.Start.X, 2) + Math.pow(a.End.Y - a.Start.Y, 2))) < 0.15) {
                        a.LineType = window.World.Crafter.LineType;
                        flag = true;
                    }
                }
            });
        }
        if (!flag) {
            window.World.Objects.Beziers.forEach(function (a) {
                if (!flag) {
                    var points = [a.Start,a.FirstControlPoint,a.SecondControlPoint,a.End];
                    flag = window.World.Crafter.Kardano(points, pnt);
                    if (flag) a.LineType = window.World.Crafter.LineType;
                }
            });
        }
    }
};
WallCrafter.prototype.DblClick = function () {
    if (!this.PlotMode) {
        document.body.style.cursor = 'default';
        window.World.UpdateCycles();
        delete this.startPoint;
        delete this.tmpWall;
        delete this.tmpBezier;
        delete this.tmpWalls;
    }
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
			ang = Math.round(this.startPoint.AngleTo(pnt) / Math.PI * 180 )  / 180 * Math.PI; 
		var norma = new Pnt(this.startPoint.X + len * Math.cos(ang), this.startPoint.Y + len * Math.sin(ang));
		normPnt = new Pnt(Math.round(norma.X / sizeCell) * sizeCell, Math.round(norma.Y / sizeCell) * sizeCell);
    }
    
    if (this.LineMode) return normPnt || pnt;
    
    if (this.BezierMode) {
        return normPnt || pnt;
    }
        
    var $this = this;
    var near = window.World.Objects.Walls.filter(function (e) { return e.Start.length(pnt) < sizeCell/2 || e.End.length(pnt) < sizeCell/2; });
    if (near.length > 0)
        return near[0].Start.length(pnt) < sizeCell/2 ? near[0].Start : near[0].End;
    else {
        // проверка есть ли уже эта линия среди нарисованных
        var onLine = window.World.Objects.Walls.map(function (e) {
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
    if (!this.PlotMode) {
        
    window.World.Drawer2D.mouse = pnt;
    pnt = this.ProcessPoint(pnt);
    if (typeof this.startPoint !== "undefined" && (this.startPoint.X != pnt.X || this.startPoint.Y != pnt.Y)) {
        document.body.style.cursor = 'crosshair';
        if (this.WallMode) {
            if (typeof this.tmpWall !== "undefined") {
                window.World.undo();
                delete this.tmpWall;
            }
            if (typeof this.tmpWalls === "undefined") {
                this.tmpWalls = [
                    new Wall(this.startPoint, new Pnt(this.startPoint.X, pnt.Y)),
                    new Wall(new Pnt(this.startPoint.X, pnt.Y), pnt),
                    new Wall(pnt, new Pnt(pnt.X, this.startPoint.Y)),
                    new Wall(new Pnt(pnt.X, this.startPoint.Y), this.startPoint)];
                window.World.UndoedEvents = [];
                window.World.UndoedEvents.push({
                    obj: this.tmpWalls,
                    redo: function () {
                        this.obj.forEach(function (e) {
                            window.World.Objects.Walls.push(e);
                        });
                        window.World.Draw();
                    },
                    undo: function () {
                        this.obj.forEach(function (e) {
                            delete window.World.Objects.Walls[window.World.Objects.Walls.indexOf(e)];
                        });
                        window.World.Draw();
                    }
                });
                window.World.redo();
            } else {
                this.tmpWalls[0].End = new Pnt(this.startPoint.X, pnt.Y);
                this.tmpWalls[1].Start = new Pnt(this.startPoint.X, pnt.Y);
                this.tmpWalls[1].End = pnt;
                this.tmpWalls[2].Start = pnt;
                this.tmpWalls[2].End = new Pnt(pnt.X, this.startPoint.Y);
                this.tmpWalls[3].Start = new Pnt(pnt.X, this.startPoint.Y);
                //                window.World.Drawer2D.Message = Math.round(this.tmpWalls[0].End.length(this.tmpWalls[0].Start)) / 100 + " x "+Math.round(this.tmpWalls[1].End.length(this.tmpWalls[1].Start)) / 100+" м";
            }
        } else if (this.BezierMode) {
            if (typeof this.tmpBezier === "undefined") {
                this.tmpBezier = new BezierCurve(this.startPoint, pnt, pnt, pnt, 1);
                window.World.UndoedEvents = [];
                window.World.UndoedEvents.push({
                    obj: this.tmpBezier,
                    redo: function () {
                        window.World.Objects.Beziers.push(this.obj);
                        window.World.Draw();
                    },
                    undo: function () {
                            for (var i in window.World.Objects.Beziers) {
                                if (window.World.Objects.Beziers[i] === this.obj)
                                    delete window.World.Objects.Beziers[i];
                            }
                        window.World.Draw();
                    }
                });
                window.World.redo();
            } else {
                switch (this.tmpBezier.CurrentIndex) {
                    case 1:
                        this.tmpBezier.FirstControlPoint = this.tmpBezier.SecondControlPoint = this.tmpBezier.End = pnt;
                        break;
                    case 2:
                        this.tmpBezier.SecondControlPoint = this.tmpBezier.End = pnt;
                        break;
                    case 3:
                        this.tmpBezier.End = pnt;
                        break;
                }
            }
        } else {
            if (typeof this.tmpWalls !== "undefined") {
                window.World.undo();
                delete this.tmpWalls;
            }

            if (typeof this.tmpWall === "undefined") {
                this.tmpWall = new Wall(this.startPoint, pnt);

                window.World.UndoedEvents = [];
                window.World.UndoedEvents.push({
                    obj: this.tmpWall,
                    redo: function () {
                        if (window.World.Crafter.LineMode) window.World.Objects.Normals.push(this.obj);
                        if (window.World.Crafter.WallMode || window.World.Crafter.BentMode) window.World.Objects.Walls.push(this.obj);
                        window.World.Draw();
                    },
                    undo: function () {
                        if (window.World.Crafter.WallMode || window.World.Crafter.BentMode)
                            for (var i in window.World.Objects.Walls) {
                                if (window.World.Objects.Walls[i] === this.obj)
                                    delete window.World.Objects.Walls[i];
                            }
                        if (window.World.Crafter.LineMode)
                            for (var i in window.World.Objects.Normals) {
                                if (window.World.Objects.Normals[i] === this.obj)
                                    delete window.World.Objects.Normals[i];
                            }
                        
                        window.World.Draw();
                    }
                });
                window.World.redo();

            } else {
                this.tmpWall.End = pnt;
                //                window.World.Drawer2D.Message = Math.round(this.tmpWall.End.length(this.tmpWall.Start)) / 100 + "м";
            }
        }
        window.World.Draw();
    } else {
        delete window.World.Drawer2D.Message;
    }
    }
};
WallCrafter.prototype.Kardano = function (points,pnt) {
    var z = [];
    var x = [];
    z[0] = points[3].X - 3 * points[2].X + 3 * points[1].X - points[0].X;
    z[1] = 3 * points[2].X - 6 * points[1].X + 3 * points[0].X;
    z[2] = 3 * points[1].X - 3*points[0].X;
    z[3] = points[0].X - pnt.X;
    var a = z[1] / z[0];
    var b = z[2] / z[0];
    var c = z[3] / z[0];
    var q=(a*a-3.*b)/9.; var r=(a*(2.*a*a-9.*b)+27.*c)/54.;
    var r2=r*r; var q3=q*q*q;
        if(r2<q3) {
            var t = Math.acos(r/Math.sqrt(q3));
            a = a / 3.; q = -2. * Math.sqrt(q);
            x[0] = q * Math.cos(t / 3.) - a;
            x[1] = q * Math.cos((t + 2*Math.PI) / 3.) - a;
            x[2] = q * Math.cos((t - 2*Math.PI) / 3.) - a;
    //        return(3);
        }
        else {
            var aa,bb;
            if(r<=0.) r=-r;
            aa=-Math.pow(r+Math.sqrt(r2-q3),1./3.); 
            if(aa!=0.) bb=q/aa;
            else bb=0.;
            a/=3.; q=aa+bb; r=aa-bb; 
            x[0]=q-a;
            x[1]=(-0.5)*q-a;
            x[2]=(-Math.sqrt(3.)*0.5)*Math.abs(r);
//            if(x[2]==0.) return(2);
    //        return(1);
        }
    for (var i = 0; i < x.length; i++) {
        var y = Math.pow(1 - x[i], 3) * points[0].Y + 3 * x[i] * Math.pow(1 - x[i], 2) * points[1].Y + 3 * Math.pow(x[i], 2) * (1 - x[i]) * points[2].Y + Math.pow(x[i], 3) * points[3].Y;
        if (Math.abs(y - pnt.Y) < 2) {
            return true;
        }
    }
    return false;

};
