GetMaxAndMin = function (a) {
    var minX = Math.min(), maxX = Math.max(), minY = Math.min(), maxY = Math.max();
    a.forEach(function (b) {
        minX = Math.min(minX, b.Start.X, b.End.X);
        maxX = Math.max(maxX, b.Start.X, b.End.X);
        minY = Math.min(minY, b.Start.Y, b.End.Y);
        maxY = Math.max(maxY, b.Start.Y, b.End.Y);
    });
    return { min: new Pnt(minX, minY), max: new Pnt(maxX, maxY) };
};
GetMaxAndMinArr = function (a) {
    var minX = Math.min(), maxX = Math.max(), minY = Math.min(), maxY = Math.max();
    a.forEach(function (b) {
        minX = Math.min(minX, b.X);
        maxX = Math.max(maxX, b.X);
        minY = Math.min(minY, b.Y);
        maxY = Math.max(maxY, b.Y);
    });
    return { min: new Pnt(minX, minY), max: new Pnt(maxX, maxY) };
};
GetHash = function (arr) {
    if (typeof arr === "undefined") return "";
    var res = [];
    arr.forEach(function (a) {
        res.push(a.X+":"+a.Y);
    });
    res = res.sort();
    var s = "";
    res.forEach(function (b) {
        s += b + ",";
    });
    return s;
};
var createPath = function(arr) {
    var res1 = [], i, pp;
    pp = arr[0].Start;
    res1.push(pp);
    for (i in arr) {
        if (!isNaN(parseFloat(i)) && isFinite(i)) {
            pp = arr[i].Start.length(pp) < 0.1 ? arr[i].End : arr[i].Start;
            res1.push(pp);
        }
    }
    return res1;
};
getSquareForPoints = function(pnts) {
    var r = 0;
    var res1 = pnts, i;
    for (i = 0; i < res1.length; ++i) {
        var p = res1[i];
        var p1 = res1[(i + 1) % res1.length];
        var x1 = p.X, x2 = p1.X, y1 = p.Y, y2 = p1.Y;
        r += (y2 - y1) * (x2 + x1);
    }
    return Math.abs(r);
};
getSquare = function (pnts) {
    var r = 0;
    var res1 = [], i, pp;
    pp = pnts[0].Start;
    res1.push(pp);
    for (i = 0; i < pnts.length + 1; ++i) {
        var j = i % pnts.length;
        pp = pnts[j].End.length(pp) < 1 ? pnts[j].Start : pnts[j].End;
        if (i < pnts.length - 1 && res1.filter(function (b) {
            return b.length(pp) < 0.1;
        }).length > 0)
            return Math.min();
        res1.push(pp);
    }
    for (i = 0; i < res1.length; ++i) {
        var p = res1[i];
        var p1 = res1[(i + 1) % res1.length];
        var x1 = p.X, x2 = p1.X, y1 = p.Y, y2 = p1.Y;
        r += (y2 - y1) * (x2 + x1);
    }
    return Math.abs(r);
};
findPath = function (points, lines) {
    var eps = 10, start = points[0], last = points[points.length - 1], activePoints, i, arr = [], candidates, res = [];
    if (points.length == 1)
        activePoints = [last.Start, last.End];
    else {
        var preLast = points[points.length - 2];
        activePoints = [last.Start.length(preLast.Start) < eps ? last.End : last.Start.length(preLast.End) < eps ? last.End : last.Start];
    }
    if (typeof start === "undefined" || start === null) return res;
    for (i in points) {
        if (i == 0 || i == points.length - 1)
            arr.push(points[i]);
    }
    candidates = lines.filter(function (a) {
        // стена идет из активных точек
        return activePoints.filter(function (pnt) {
            return ((pnt.length(a.Start) < eps && pnt.length(a.End) > eps)) || ((pnt.length(a.End) < eps && pnt.length(a.Start) > eps));
        }).length > 0;
    }).filter(function (a) {
        // этой стены не было
        return points.indexOf(a) < 0;
    });
    if (candidates.length === 0)
        return [points];
    for (i in candidates) {
        var r;
        var cand = candidates[i];
        r = findPath(points.concat(cand), lines);
        res = res.concat(r);
    }
    return res;
};
findPaths = function (allWalls) {
    var lines = [];
    allWalls.forEach(function (n) {
        if (lines.filter(function (d) {
            return d == n;
        }).length === 0) lines.push(n);
    });
    var res = [];
    var resHash = [];
    lines.forEach(function (b) {
        var r = findPath([b], lines);
        for (var i in r) {
            var rrrr = r[i];
            var hhh = GetHash(rrrr);
            var rrr = resHash.filter(function (t) {
                return t == hhh;
            }).length;
            if (rrr == 0) {
                var rr = [];
                rrrr.forEach(function (e) { rr.push(e); });
                res.push(rr);
                resHash.push(hhh);
            }
        }
    });
    return res;
};
findCycle = function (points, lines) {
    var eps = 0.1;
    var start = points[0];
    var last = points[points.length - 1];
    var activePoints;
    if (points.length == 1)
        activePoints = [last.Start, last.End];
    else {
        var preLast = points[points.length - 2];
        activePoints = [last.Start.length(preLast.Start) < eps ? last.End : last.Start.length(preLast.End) < eps ? last.End : last.Start];
    }
    if (typeof start === "undefined") return undefined;
    var arr = [];
    for (i in points) {
        if (i == 0 || i == points.length - 1)
            arr.push(points[i]);
    }
    var candidates = lines.filter(function(a) {
        // стена идет из активных точек
        return activePoints.filter(function(pnt) {
            return ((pnt.length(a.Start) < eps && pnt.length(a.End) > eps)) || ((pnt.length(a.End) < eps && pnt.length(a.Start) > eps));
        }).length > 0;
    }).filter(function(a) {
        // этой стены не было
        return points.indexOf(a) < 0;
    });
    var min = Math.min();
    var minRes = undefined;
    for (var i in candidates) {
        var r;
        var cand = candidates[i];
        if (start.Start.length(cand.End) < eps)
            r = points.concat(cand);
        else if (start.Start.length(cand.Start) < eps)
            r = points.concat(cand);
        else
            r = findCycle(points.concat(cand), lines);
        if (typeof (r) === "undefined") continue;

        var metr = getSquare(r);
        if (metr < 1) continue;
        if (metr < min) {
            min = metr;
            minRes = r;
        }
    }
    return minRes;
};
findCycles = function (allWalls) {
    var lines = [];
    allWalls.forEach(function (n) {
        if (lines.filter(function (d) {
            return d == n;
        }).length === 0) lines.push(n);
    });
    var res = [];
    var resHash = [];
    lines.forEach(function (b) {
        var r = findCycle([b], lines);
        if (typeof r === "undefined") return;
        var hhh = GetHash(r);
        var rrr = resHash.filter(function (t) {
            return t == hhh;
        }).length;
        if (rrr == 0) {
            var rr = [];
            r.forEach(function (e) { rr.push(e); });
            res.push(rr);
            resHash.push(hhh);
        }
    });
    return res.map(function (a) {
        var last = a[0].Start;
        return a.map(function (b) { last = last.length(b.Start) < 1 ? b.End : b.Start;
            return last;
        });
    });
};