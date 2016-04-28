var WallCrafter = function () {
    this.PrecisionMode = false;
    this.WallMode = false;
    this.BentMode = true;
    this.LineMode = false;
    this.BezierMode = false;
    this.ArcMode = false;
    this.SmoothMode = false;
    this.ResultMode = false;
    this.PlotMode = false;
    this.GridMode = true;
    this.PaintMode = "WallMode";
    this.LineType = "main";
    this.LinkType = "none";
    SimpleCrafter.call(this);
};
WallCrafter.prototype = new SimpleCrafter();
WallCrafter.prototype.SetPaintMode = function (flag) {
    this.WallMode = false;
    this.BezierMode = false;
    this.SmoothMode = false;
    this.ArcMode = false;
    this.LineMode = false;
    this.BentMode = false;
    this.CircleMode = false;
    this.PaintMode = flag;
    this.LinkType = "none";
    delete this.startPoint;
};
WallCrafter.prototype.SetBentMode = function () {
    this.SetPaintMode("BentMode");
    this.BentMode = true;
    delete this.startPoint;
};
WallCrafter.prototype.SetArcMode = function () {
    this.SetPaintMode("ArcMode");
    this.ArcMode = true;
    delete this.startPoint;
};
WallCrafter.prototype.SetCircleMode = function () {
    this.SetPaintMode("CircleMode");
    this.CircleMode = true;
    delete this.startPoint;
};
WallCrafter.prototype.SetSmoothMode = function () {
    this.SetPaintMode("SmoothMode");
    this.SmoothMode = true;
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
WallCrafter.prototype.SetLinkType = function (flag) {
    this.LinkType = flag;
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
            delete this.tmpCurve;
            delete this.tmpArc;
            delete this.tmpRuler;
            delete this.tmpWalls;
            delete this.tmpLinkPoint;
            delete this.tmpVectorPoint;
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
    if (this.PlotMode) {
        this.CheckPoint(this.ProcessPoint(pnt), 0.15);
        return;
    }
        document.body.style.cursor = 'default';
        delete this.tmpWall;
        delete this.tmpWalls;
        if (this.LinkType != "none" && !$.isEmptyObject(window.World.Objects.TempLinkPoint)) {
            this.AddLinkPoint();
        }
        delete window.World.Drawer2D.Message;
        delete this.tmpLinkPoint;
        if (typeof this.startPoint !== "undefined") {
            if (this.LinkType == "parallel" && this.Ruler) {
                this.startPoint = this.ProcessPoint(pnt);
                this.Ruler = false;
                        return;
            }
            if (this.WallMode || this.LineMode) {
                window.World.UpdateCycles();
                delete this.startPoint;
                delete this.tmpVectorPoint;
                return;
            } else if (this.BezierMode) {
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
            } else if (this.SmoothMode) {
                window.World.UpdateCycles();
                delete this.startPoint;
                this.startPoint = this.ProcessPoint(pnt);
                this.tmpCurve.Points.push(pnt);
                this.tmpCurve.PntCount++;
                return;
            } else if (this.ArcMode || this.CircleMode) {
                window.World.UpdateCycles();
                var pr = this.ProcessPoint(pnt);
                if (typeof this.tmpArc === "undefined") {
                    this.tmpArc = new Arc();
                    this.tmpArc.Center = this.startPoint;
                    this.tmpArc.Start = pr;
                    this.tmpArc.IsCircle = this.CircleMode;
                    delete this.tmpRuler;
                    window.World.Objects.Ruler = {};
                    delete this.startPoint;
                    if (this.CircleMode) {
                        this.tmpArc.End = pr;
                        window.World.UndoedEvents = [];
                        window.World.UndoedEvents.push({
                            obj: this.tmpArc,
                            redo: function () {
                                window.World.Objects.Arcs.push(this.obj);
                                window.World.Draw();
                            },
                            undo: function () {
                                for (var i in window.World.Objects.Arcs) {
                                    if (window.World.Objects.Arcs[i] === this.obj)
                                        delete window.World.Objects.Arcs[i];
                                }
                                window.World.Draw();
                            }
                        });
                        window.World.redo();
                        delete this.tmpArc;
                    } else this.startPoint = pr; 
                } else {
                    delete this.tmpArc;
                    delete this.startPoint;
                }
                return;
            }
        }
        this.startPoint = this.ProcessPoint(pnt);
};
WallCrafter.prototype.DblClick = function () {
    if (!this.PlotMode) {
        document.body.style.cursor = 'default';
        window.World.UpdateCycles();
        delete this.startPoint;
        delete this.tmpWall;
        delete this.tmpBezier;
        delete this.tmpCurve;
        delete this.tmpRuler;
        delete this.tmpArc;
        delete this.tmpWalls;
        delete this.tmpVectorPoint;
        delete this.tmpLinkPoint;
        delete window.World.Drawer2D.Message;
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
    
    if (this.LineMode || this.BezierMode) return normPnt || pnt;
    
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
    if (this.PlotMode) return;
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
                this.PushElement();
            } else {
                this.tmpWalls[0].End = new Pnt(this.startPoint.X, pnt.Y);
                this.tmpWalls[1].Start = new Pnt(this.startPoint.X, pnt.Y);
                this.tmpWalls[1].End = pnt;
                this.tmpWalls[2].Start = pnt;
                this.tmpWalls[2].End = new Pnt(pnt.X, this.startPoint.Y);
                this.tmpWalls[3].Start = new Pnt(pnt.X, this.startPoint.Y);
                window.World.Drawer2D.Message = Math.round(this.tmpWalls[0].End.length(this.tmpWalls[0].Start)) + " x "+Math.round(this.tmpWalls[1].End.length(this.tmpWalls[1].Start));
            }
        } else if (this.BezierMode) {
            if (typeof this.tmpBezier === "undefined") {
                this.tmpBezier = new BezierCurve(this.startPoint, pnt, pnt, pnt, 1);
                this.PushElement();
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
        } else if (this.SmoothMode) {
            if (typeof this.tmpCurve === "undefined") {
                this.tmpCurve = new SmoothCurve([this.startPoint, pnt]);
                this.tmpCurve.PntCount = 2;
                this.PushElement();
            } else {
                this.tmpCurve.Points[this.tmpCurve.PntCount - 1] = pnt;
            }
        } else if (this.ArcMode || this.CircleMode) {
            if (typeof this.tmpArc === "undefined") {
                // значит еще не задан радиус и рисуем линейку
                this.tmpRuler = new Wall(this.startPoint, pnt);
                window.World.Drawer2D.Message = Math.round(this.tmpRuler.End.length(this.tmpRuler.Start));
                window.World.UndoedEvents = [];
                window.World.UndoedEvents.push({
                    obj: this.tmpRuler,
                    redo: function () {
                        window.World.Objects.Ruler =this.obj;
                        window.World.Draw();
                    },
                    undo: function () {
                        window.World.Objects.Ruler = {};
                        window.World.Draw();
                    }
                });
                window.World.redo();
                window.World.Draw();
            } else {
                // значит задан радиус и рисуем дугу
                if (this.ArcMode) {
                    this.tmpArc.End = pnt;
                    this.PushElement();
                }
            }
        } else {
            if (this.LinkType == "parallel" && this.Ruler) {
                this.tmpRuler = new Wall(this.startPoint, pnt);
                window.World.Drawer2D.Message = Math.round(this.tmpRuler.End.length(this.tmpRuler.Start)) ;
                this.tmpLinkPoint = pnt;
                window.World.Objects.TempLinkPoint = pnt;
                window.World.UndoedEvents = [];
                window.World.UndoedEvents.push({
                    obj: this.tmpRuler,
                    redo: function () {
                        window.World.Objects.Ruler = this.obj;
                        window.World.Draw();
                    },
                    undo: function () {
                        window.World.Objects.Ruler = {};
                        window.World.Draw();
                    }
                });
                window.World.redo();
                window.World.Draw();
                return;
            } 
            if (typeof this.tmpWalls !== "undefined") {
                window.World.undo();
                delete this.tmpWalls;
            }
            if (typeof this.tmpWall === "undefined") {
                    this.tmpWall = new Wall(this.startPoint, pnt);
                    this.PushElement();
                    delete this.tmpRuler;
                    window.World.Objects.Ruler = {};
            } else {
                if (this.LinkType == "parallel") {
                    pnt = this.GetProjectionOnParallel(pnt, this.tmpVectorPoint, this.startPoint);
                }
                if (this.LinkType == "perpendicular" && typeof this.tmpVectorPoint !== "undefined") {
                    pnt = this.GetProjectionOnPerpendicular(pnt, this.tmpVectorPoint, this.startPoint);
                } 
                this.tmpWall.End = pnt;
                window.World.Drawer2D.Message = Math.round(this.tmpWall.End.length(this.tmpWall.Start)) ;
            }
        }
        window.World.Draw();
    } else {
        delete this.tmpLinkPoint;
        window.World.Objects.TempLinkPoint = { };
        if (this.LinkType != "none" && typeof this.startPoint === "undefined") {
            var res;
            switch(this.LinkType) {
                case "parallel":
                    res = this.GetPointOnLine(pnt);
                    if (res.flag) {
                        this.tmpLinkPoint = pnt;
                        this.tmpVectorPoint = res.vector;
                        window.World.Objects.TempLinkPoint = pnt;
                        this.Ruler = true;
                    }
                    break;
                case "perpendicular":
                    res = this.GetPointOnLine(pnt);
                    if (res.flag) {
                        this.tmpLinkPoint = pnt;
                        this.tmpVectorPoint = res.vector;
                        window.World.Objects.TempLinkPoint = pnt;
                    }
                    break;
                case "extreme":
                    res = this.CheckExtremePoints(pnt);
                    if(res.flag) {
                        this.tmpLinkPoint = res.pnt;
                        window.World.Objects.TempLinkPoint = res.pnt;
                    }
                    break;
                case "linepoint":
                    if (this.CheckPoint(pnt, 0.1)) {
                        this.tmpLinkPoint = pnt;
                        window.World.Objects.TempLinkPoint = pnt;
                    }
                    break;
                case "intersection":
                    if(this.CheckIntersection(pnt)>1) {
                        this.tmpLinkPoint = pnt;
                        window.World.Objects.TempLinkPoint = pnt;
                    };
                    break;
            }
        }
//        delete window.World.Drawer2D.Message;
    }
};
WallCrafter.prototype.GetProjectionOnParallel = function (pnt, vector, linepnt) {
    // Ax+By+C=0 уравнение перпендикуляра, проходящего через точку (x1,y1) - A(y-y1)-B(x-x1)=0
    // направлящий вектор (vx,vy) и точка (x0,y0) => уравнение прямой (-vy/vx)x+y+(vy/vx*x0-y0)=0
    // проекция точки (xp,yp) на прямую => 
    var answer = new Pnt();
    answer.X = ((vector.Y / vector.X) * (pnt.Y + vector.Y / vector.X * linepnt.X - pnt.Y) + pnt.X) / (Math.pow(vector.Y / vector.X, 2) + 1);
    answer.Y = linepnt.Y + (vector.Y / vector.X) * (answer.X - linepnt.X);
    return answer;
};
WallCrafter.prototype.GetProjectionOnPerpendicular = function(pnt,vector,linepnt) {
    // Ax+By+C=0 уравнение перпендикуляра, проходящего через точку (x1,y1) - A(y-y1)-B(x-x1)=0
    // направлящий вектор (vx,vy) и точка (x0,y0) => уравнение прямой (-vy/vx)x+y+(vy/vx*x0-y0)=0
    // уравнение перпендикуляра к этой прямой через точку (x0,y0) => (-vy/vx)(y-y0) - (x-x0)=0
    // проекция точки (xp,yp) на перпендикуляр => перпендикуляр к перпендикуляру (yp-y)+(vy/vx)(x-xp) = 0
    // решаем систему, чтобы найти точку пересечения => x = ((vy/vx)(-yp+vy/vx*xp+y0)+x0)/((vy/vx)^2+1); y = yp + (vy/vx)(x-xp)
    var answer = new Pnt();
    answer.X = ((vector.Y/vector.X)*(-pnt.Y+vector.Y/vector.X*pnt.X+linepnt.Y)+linepnt.X)/(Math.pow(vector.Y/vector.X,2)+1);
    answer.Y = pnt.Y + (vector.Y/vector.X)*(answer.X - pnt.X);
    return answer;
};
WallCrafter.prototype.GetPointOnLine = function(pnt) {
    var result = { flag: 0, vector: new Pnt() };
    var accuracy = 0.1;
    window.World.Objects.Walls.concat(window.World.Objects.Normals).forEach(function(a) {
        if (!result.flag) {
            if (Math.abs(Math.sqrt(Math.pow(a.Start.X - pnt.X, 2) + Math.pow(a.Start.Y - pnt.Y, 2)) + Math.sqrt(Math.pow(a.End.X - pnt.X, 2) + Math.pow(a.End.Y - pnt.Y, 2)) - Math.sqrt(Math.pow(a.End.X - a.Start.X, 2) + Math.pow(a.End.Y - a.Start.Y, 2))) < accuracy) {
                result.flag = true;
                result.vector.X = a.End.X - a.Start.X;
                result.vector.Y = a.End.Y - a.Start.Y;
            }
        }
    });
    return result;
};
WallCrafter.prototype.CheckIntersection = function (pnt) {
    var result = { flag: 0, pnt: new Pnt() };
    var accuracy = 0.15;
    window.World.Objects.Walls.concat(window.World.Objects.Normals).forEach(function (a) {
        if (result.flag < 2) {
            if (Math.abs(Math.sqrt(Math.pow(a.Start.X - pnt.X, 2) + Math.pow(a.Start.Y - pnt.Y, 2)) + Math.sqrt(Math.pow(a.End.X - pnt.X, 2) + Math.pow(a.End.Y - pnt.Y, 2)) - Math.sqrt(Math.pow(a.End.X - a.Start.X, 2) + Math.pow(a.End.Y - a.Start.Y, 2))) < accuracy) {
                result.flag++;
            }
        }
    });
    if (result.flag < 2) {
        window.World.Objects.Beziers.forEach(function (a) {
            if (result.flag < 2) {
                var points = [a.Start, a.FirstControlPoint, a.SecondControlPoint, a.End];
                if (window.World.Crafter.Kardano(points, pnt)) {
                    result.flag++;
                }
            }
        });
    }
    if (result.flag < 2) {
        window.World.Objects.Curves.forEach(function (a) {
            if (result.flag < 2) {
                if (window.World.Crafter.CheckPointInCurve(a.Points, pnt, accuracy)) {
                    result.flag++;
                }
            }
        });
    }
    if (result.flag < 2) {
        window.World.Objects.Arcs.forEach(function (a) {
            if (result.flag < 2) {
                if (window.World.Crafter.CheckPointInArc(a.Start, a.End, a.Center, pnt, a.IsCircle, accuracy)) {
                    result.flag++;
                }
            }
        });
    }
    // пока только приблизительная точка
    return result.flag;
};
WallCrafter.prototype.CheckExtremePoints = function (pnt) {
    var result = { flag: false, pnt: new Pnt() };
    var accuracy = 10;
    window.World.Objects.Walls.concat(window.World.Objects.Normals).concat(window.World.Objects.Beziers).concat(window.World.Objects.Arcs).forEach(function (a) {
        if (!result.flag) {
            if (a.Start.length(pnt) < accuracy) {
                result.flag = true;
                result.pnt = a.Start;
            } else if (a.End.length(pnt) < accuracy) {
                result.flag = true;
                result.pnt = a.End;
            }
        }
    });
    if (!result.flag) {
        window.World.Objects.Curves.forEach(function (a) {
            if (!result.flag) {
                if (a.Points[0].length(pnt) < accuracy) {
                    result.flag = true;
                    result.pnt = a.Points[0];
                } else if (a.Points[a.PntCount - 1].length(pnt) < accuracy) {
                    result.flag = true;
                    result.pnt = a.Points[a.PntCount - 1];
                }
            }
        });
    }
    return result;
};
WallCrafter.prototype.CheckPointInCurve = function (points, pnt, accuracy) {
    var a = {Start:points[0]};
    for (var i = 1; i < points.length; i++) {
        a.End = points[i];
        if (Math.abs(Math.sqrt(Math.pow(a.Start.X - pnt.X, 2) + Math.pow(a.Start.Y - pnt.Y, 2)) + Math.sqrt(Math.pow(a.End.X - pnt.X, 2) + Math.pow(a.End.Y - pnt.Y, 2)) - Math.sqrt(Math.pow(a.End.X - a.Start.X, 2) + Math.pow(a.End.Y - a.Start.Y, 2))) < accuracy+0.05) {
            return true;
        }
        a.Start = points[i];
    }
    return false;
};
WallCrafter.prototype.CheckPointInArc = function (start, end, center, pnt, isCircle, accuracy) {
    //    1) строим уравнение окружности
    //    2) если заданная точка окружности не принадлежит, то ответ отрицательный
    if (Math.abs(Math.pow(pnt.X - center.X, 2) + Math.pow(pnt.Y - center.Y, 2) - Math.pow(center.length(start), 2)) > accuracy*10000+1000) return false;
    if (isCircle) return true;
    //  проверяем угол
    var startAngle = Math.acos((start.X - center.X) / (center.length(start) + 1)) * 180 / Math.PI, endAngle = Math.acos((end.X - center.X) / (center.length(end) + 1)) * 180 / Math.PI, needAngle = Math.acos((pnt.X - center.X) / (center.length(pnt) + 1)) * 180 / Math.PI;
    if (start.Y < center.Y) {
        startAngle = 360 - startAngle;
    }
    if (end.Y < center.Y) {
        endAngle = 360 - endAngle;
    }
    if (pnt.Y < center.Y) {
        needAngle = 360 - needAngle;
    }
    return (startAngle < endAngle && needAngle > startAngle && needAngle < endAngle)
        || (startAngle > endAngle && ((needAngle > startAngle && needAngle <= 360) || needAngle < endAngle));
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
        }
    for (var i = 0; i < x.length; i++) {
        var y = Math.pow(1 - x[i], 3) * points[0].Y + 3 * x[i] * Math.pow(1 - x[i], 2) * points[1].Y + 3 * Math.pow(x[i], 2) * (1 - x[i]) * points[2].Y + Math.pow(x[i], 3) * points[3].Y;
        if (Math.abs(y - pnt.Y) < 10) {
            return true;
        }
    }
    return false;

};
WallCrafter.prototype.CheckPoint = function(pnt,accuracy) {
    var result = { flag: 0, pnt: new Pnt() };
    window.World.Objects.Walls.concat(window.World.Objects.Normals).forEach(function (a) {
        if (!result.flag) {
            if (Math.abs(Math.sqrt(Math.pow(a.Start.X - pnt.X, 2) + Math.pow(a.Start.Y - pnt.Y, 2)) + Math.sqrt(Math.pow(a.End.X - pnt.X, 2) + Math.pow(a.End.Y - pnt.Y, 2)) - Math.sqrt(Math.pow(a.End.X - a.Start.X, 2) + Math.pow(a.End.Y - a.Start.Y, 2))) < accuracy) {
                if (window.World.Crafter.PlotMode) a.LineType = window.World.Crafter.LineType;
                result.flag = true;
            }
        }
    });
    if (!result.flag) {
        window.World.Objects.Beziers.forEach(function(a) {
            if (!result.flag) {
                var points = [a.Start, a.FirstControlPoint, a.SecondControlPoint, a.End];
                result.flag = window.World.Crafter.Kardano(points, pnt);
                if (result.flag) {
                    if (window.World.Crafter.PlotMode) a.LineType = window.World.Crafter.LineType;
                    result.flag = true;
                }
            }
        });
    }
    if (!result.flag) {
        window.World.Objects.Curves.forEach(function(a) {
            if (!result.flag) {
                result.flag = window.World.Crafter.CheckPointInCurve(a.Points, pnt, accuracy);
                if (result.flag) {
                    if (window.World.Crafter.PlotMode) a.LineType = window.World.Crafter.LineType;
                    result.flag = true;
                }
            }
        });
    }
    if (!result.flag) {
        window.World.Objects.Arcs.forEach(function(a) {
            if (!result.flag) {
                result.flag = window.World.Crafter.CheckPointInArc(a.Start, a.End, a.Center, pnt, a.IsCircle, accuracy);
                if (result.flag) {
                    if (window.World.Crafter.PlotMode) a.LineType = window.World.Crafter.LineType;
                    result.flag = true;
                }
            }
        });
    }
    // пока только приблизительная точка
    return result.flag;
};
WallCrafter.prototype.PushElement = function() {
    var obj = this.tmpWall;
    if (this.ArcMode || this.CircleMode) obj = this.tmpArc;
    else if (this.SmoothMode) {
        obj = this.tmpCurve;
    } else if (this.BezierMode) {
        obj = this.tmpBezier;
    } else if (this.WallMode) {
        obj = this.tmpWalls;
    }
    window.World.UndoedEvents = [];
    window.World.UndoedEvents.push({
        obj: obj,
        redo: function() {
            if (window.World.Crafter.LineMode) window.World.Objects.Normals.push(this.obj);
            if (window.World.Crafter.BentMode) window.World.Objects.Walls.push(this.obj);
            if (window.World.Crafter.WallMode)
                this.obj.forEach(function(e) {
                    window.World.Objects.Walls.push(e);
                });
            if (window.World.Crafter.ArcMode || window.World.Crafter.CircleMode) window.World.Objects.Arcs.push(this.obj);
            if (window.World.Crafter.SmoothMode) window.World.Objects.Curves.push(this.obj);
            if (window.World.Crafter.BezierMode) window.World.Objects.Beziers.push(this.obj);
            window.World.Draw();
        },
        undo: function() {
            if (window.World.Crafter.BentMode)
                for (var i in window.World.Objects.Walls) {
                    if (window.World.Objects.Walls[i] === this.obj)
                        delete window.World.Objects.Walls[i];
                }
            else if (window.World.Crafter.LineMode)
                for (var i in window.World.Objects.Normals) {
                    if (window.World.Objects.Normals[i] === this.obj)
                        delete window.World.Objects.Normals[i];
                }
            else if (window.World.Crafter.ArcMode || window.World.Crafter.CircleMode)
                for (var i in window.World.Objects.Arcs) {
                    if (window.World.Objects.Arcs[i] === this.obj)
                        delete window.World.Objects.Arcs[i];
                }
            else if (window.World.Crafter.SmoothMode)
                for (var i in window.World.Objects.Curves) {
                    if (window.World.Objects.Curves[i] === this.obj)
                        delete window.World.Objects.Curves[i];
                }
            else if (window.World.Crafter.BezierMode)
                for (var i in window.World.Objects.Beziers) {
                    if (window.World.Objects.Beziers[i] === this.obj)
                        delete window.World.Objects.Beziers[i];
                }
            else if (window.World.Crafter.WallMode)
                this.obj.forEach(function(e) {
                    delete window.World.Objects.Walls[window.World.Objects.Walls.indexOf(e)];
                });
            window.World.Draw();
        }
    });
    window.World.redo();
};
WallCrafter.prototype.AddLinkPoint = function () {
    window.World.Objects.TempLinkPoint = {};
    window.World.UndoedEvents = [];
    window.World.UndoedEvents.push({
        obj: this.tmpLinkPoint,
        redo: function () {
            window.World.Objects.LinkPoints.push(this.obj);
            window.World.Draw();
        },
        undo: function () {
            for (var i in window.World.Objects.LinkPoints) {
                if (window.World.Objects.LinkPoints[i] === this.obj)
                    delete window.World.Objects.LinkPoints[i];
            }
            window.World.Draw();
        }
    });
    window.World.redo();
    window.World.Draw();
}