function PCXBlock(runtime, element) {

element.Modes = { two: '2d', three: '3d', guide: 'guide'};
var parentness = {};
element.WorldClass = function (container) {
    this.Id = new Guid().Value;
    this.Objects = {
        Walls: [],
        Areas: [],
        Objs: [],
        Line: [],
        Elements: [],
        Normals: [],
        Beziers: [],
        SavedResult:''
    };
    this.Events = [];
    this.UndoedEvents = [];
    this.mode = element.Modes.two;
    this.leftMouse = false;
    this.rightMouse = false;
    if (typeof container !== "undefined") {
        this.Drawer2D = new Drawer2D(container);
        this.SetMode(this.mode);
        this.Behaviour = new Behaviour(container[0]);
        var pressedKeys = [];
        var border = 40;
        var $this = this;
        this.shiftKey = false;
        this.Behaviour.Subscribe(function(e) {
            if (e.type === "scroll" && e.data.Z !== 0) {
                if (e.data.Z > 0)
                    $this.Drawer.ScaleDown();
                else $this.Drawer.ScaleUp();
                $this.Draw();
            }
            if (typeof $this.Crafter !== "undefined") {
                if (e.type === "keydown") {
                    if (pressedKeys.indexOf(e.data.key) < 0) {
                        if (e.data.key == 16)
                            $this.shiftKey = true;
                        pressedKeys.push(e.data.key);
                        $this.Crafter.ProcessCommand({ type: 'keydown', key: e.data.key });
                    }
                }
                if (e.type === "keyup") {
                    if (pressedKeys.indexOf(e.data.key) >= 0) {
                        if (e.data.key == 16)
                            $this.shiftKey = false;
                        delete pressedKeys[pressedKeys.indexOf(e.data.key)];
                        $this.Crafter.ProcessCommand({ type: 'keyup', key: e.data.key });
                    }
                }

                var p = $this.Drawer.GetWorldPoint(e.data);
                if (e.type === "mousemove") {
                    $this.Crafter.ProcessCommand({ type: 'move', point: p, rightButton: e.data.rightButton, leftButton: e.data.leftButton });
                }
                if (e.type === "mousedown") {
                    $this.leftMouse = (e.data.leftButton);
                    $this.rightMouse = (e.data.rightButton);
                    $this.Crafter.ProcessCommand({ type: 'down', point: p, rightButton: e.data.rightButton, leftButton: e.data.leftButton });
                }
                if (e.type === "mouseup") {
                    if (e.data.leftButton)
                        $this.leftMouse = false;
                    if (e.data.rightButton)
                        $this.rightMouse = false;
                    $this.Crafter.ProcessCommand({ type: 'up', point: p, rightButton: e.data.rightButton, leftButton: e.data.leftButton });
                }
                if (e.type === "dblclick") {
                    if (e.data.leftButton)
                        $this.leftMouse = false;
                    if (e.data.rightButton)
                        $this.rightMouse = false;
                    $this.Crafter.ProcessCommand({ type: 'dbl', point: p, rightButton: e.data.rightButton, leftButton: e.data.leftButton });
                }
            }
            //$this.Draw();
        });
        var $this = this;
        var d = 10;
        var cnt = 1;
        var dr = function() {
            setInterval(function() {
                $this.Draw();
            }, d);
        };
        for (var i = 0; i < cnt; ++i) {
            setTimeout(dr, d/cnt * i);
        }
    }
};

element.WorldClass.prototype = {
    constructor: element.WorldClass,
    undo: function() {
        if (this.Events.length > 0) {
            var e = this.Events.pop();
            this.UndoedEvents.push(e);
            e.undo();
        }
    },
    redo: function() {
        if (this.UndoedEvents.length > 0) {
            var e = this.UndoedEvents.pop();
            this.Events.push(e);
            e.redo();
        }
    },
    UpdateCycles: function () {
        return;
        var cycles = findCycles(this.Objects.Walls);
        var hashes = [];
        var i;
        for (i in cycles) {
            var h = GetHash(cycles[i]);
            hashes.push(h);
            if (typeof this.Objects.Areas[h] === "undefined") {
                this.Changed = true;
                this.Objects.Areas[h] = cycles[i];
            }
        }
        for (i in this.Objects.Areas) {
            if (hashes.indexOf(i) < 0) {
                this.Changed = true;
                delete this.Objects.Areas[i];
            }
        }
    },
    Draw: function () {
        if (typeof this.lastDate !== "undefined" && Date.now() - this.lastDate < 100)
            return;
        this.lastDate = Date.now();
        this.Drawer.Start();
        if (this.Crafter.PlotMode) this.Drawer.Draw(this.Objects, '#CBBFA8');
        else this.Drawer.Draw(this.Objects);
        this.Drawer.End();
    },
    SetAllObjectsGrey: function() {
        this.Objects.forEach(function(elem) {
            elem.forEach(function(el) {

            });
        });
    },
    Compute: function(cb) {
        var wps = {}; 
        this.Objects.Walls.forEach(function(a) {
            var arrs = a.Config.Left.fill.objs.concat(a.Config.Right.fill.objs);
            arrs = arrs.filter(function(b) {
                return typeof b.image !== "undefined";
            });
            for (var i in arrs) {
                if (arrs[i].id <= 0) continue;
                if (isNaN(arrs[i].Pnt.X) || typeof(arrs[i].id) === "undefined") continue;
                if (typeof wps[arrs[i].id] === "undefined") {
                    wps[arrs[i].id] = {id:arrs[i].id, w: arrs[i].w, l: 0, image: arrs[i].image, inf: ' м', name: arrs[i].name};
                }
                var ceil = Math.ceil(arrs[i].width/arrs[i].w);
                if (((arrs[i].width-arrs[i].w*ceil)/arrs[i].w) > 0)
                    ceil++;
                wps[arrs[i].id].l += ceil*arrs[i].height/100;
            }
        });
        this.Objects.Walls.forEach(function(a) {
            var arrs = (a.Config.Left.tiles||[]).concat(a.Config.Right.tiles||[]);
            arrs = arrs.filter(function(b) {
                return typeof b.image !== "undefined";
            });
            for (var i in arrs) {
                if (typeof(arrs[i].id) === "undefined") continue;
                if (typeof wps[arrs[i].id] === "undefined") {
                    wps[arrs[i].id] = {id:arrs[i].id, l: 0, image: arrs[i].image, inf: ' пл', name: arrs[i].name };
                }
                if (typeof wps[arrs[i].id].name === 'undefined')
                    wps[arrs[i].id].name = arrs[i].name;
                wps[arrs[i].id].l++;
            }
        });
        for (var k in this.Objects.Areas) {
            var a = this.Objects.Areas[k];
            var arrs = a.tiles||[];
            var mm = GetMaxAndMinArr(a);
            var oo = a;
            oo = oo.map(function (b) { return new Pnt((b.X - mm.min.X)*2, (b.Y - mm.min.Y)*2); });
            arrs = arrs.filter(function(b) {
                var pnt = new Pnt((b.w+2*a.tilebordw)*(b.col),(b.h+2*a.tilebordh)*(b.row));
                var pnt1 = new Pnt((b.w+2*a.tilebordw)*(b.col+1),(b.h+2*a.tilebordh)*(b.row));
                var pnt2 = new Pnt((b.w+2*a.tilebordw)*(b.col+1),(b.h+2*a.tilebordh)*(b.row+1));
                var pnt3 = new Pnt((b.w+2*a.tilebordw)*(b.col),(b.h+2*a.tilebordh)*(b.row+1));
                return typeof b.image !== "undefined" && (AreIsIn(oo, pnt) || AreIsIn(oo, pnt1) || AreIsIn(oo, pnt2) || AreIsIn(oo, pnt3));
            });
            for (var i in arrs) {
                if (typeof(arrs[i].id) === "undefined") continue;
                if (typeof wps[arrs[i].id] === "undefined") {
                    wps[arrs[i].id] = {id:arrs[i].id, l: 0, image: arrs[i].image, inf: ' пл', name: arrs[i].name };
                }
                if (typeof wps[arrs[i].id].name === 'undefined')
                    wps[arrs[i].id].name = arrs[i].name;
                wps[arrs[i].id].l++;
            }
            arrs = a.lams||[];
            arrs = arrs.filter(function(b) {
                return typeof b.image !== "undefined";
            });
            if (arrs.length > 0) {
                var i = 0;
                if (typeof(arrs[i].id) === "undefined") continue;
                if (typeof wps[arrs[i].id] === "undefined") {
                    wps[arrs[i].id] = {id:arrs[i].id, image: arrs[i].image, l: 0, inf: ' м x м', name: arrs[i].name  };
                }
                if (typeof wps[arrs[i].id].name === 'undefined')
                    wps[arrs[i].id].name = arrs[i].name;
                wps[arrs[i].id].l += Math.round(getSquareForPoints(a)/ 200)/100;
            }
        }
        var cnt =0;
        for (var i in wps) {
            cnt++;
            (function(th) {
                var res = '';
                var ccb = function() {
                    th.cat = res;
                    cb(th);
                };
                var getPrnt = function(id, end) {
                    var l = res.length+6;
                    if (typeof parentness[id] !== 'undefined') {
                        res = parentness[id]+" &gt; "+res;
                        end();
                        return;
                    } else {
                        var newEnd = function() {
                            parentness[id] = res.substr(0, res.length - l);
                            end();
                        };
                        getFromDB('waregroup', 'id=' + id, function(a){
                            if (a.length == 0 || a[0].id == 0) {
                                newEnd();
                                return;
                            }
                            res = a[0].name+" &gt; "+res;
                            getPrnt(a[0].pid, newEnd);
                        });
                    }
                };
                getFromDB('ware', 'id=' + wps[i].id, function(b){
                    getPrnt(b[0].pid, ccb);
                });
            })(wps[i]);
        }
        return cnt;
    },
    SetMode: function (mode) {
        $('.loader').css('display', 'block');
        this.Changed = true;
        var mm = GetMaxAndMinArr([]);
        this.Objects.Walls.forEach(function (a) {
            mm.max.X = Math.max(mm.max.X, a.Start.X, a.End.X);
            mm.max.Y = Math.max(mm.max.Y, a.Start.Y, a.End.Y);
            mm.min.X = Math.min(mm.min.X, a.Start.X, a.End.X);
            mm.min.Y = Math.min(mm.min.Y, a.Start.Y, a.End.Y);
        });
        var center = mm.max.center(mm.min);
        if (mode === element.Modes.two) {
            $(this.Drawer2D.canvas).show();
//            this.Drawer2D.Offset.X = center.X - this.Drawer2D.canvas.width / 2;
            //            this.Drawer2D.Offset.Y = center.Y - this.Drawer2D.canvas.height / 2;
            this.Drawer2D.Offset.X = 0;
            this.Drawer2D.Offset.Y = 0;
            this.Drawer = this.Drawer2D;
            //this.Draw();
        } 
        $('.loader').css('display', 'none');
    },
    SaveToLocalStorage:function() {
        this.Save(function(o) {
            element.localStorage.setItem("saved", JSON.stringify(o));
        });
    },
    SaveToDB: function () {
        var cnv = document.createElement('canvas');
        cnv.width = 100;
        cnv.height = 100;
        var ctx = cnv.getContext('2d');
        ctx.fillStyle = "#bbb";
        ctx.fillRect(0, 0, 100, 100);
        var img;
        if (typeof this.Drawer3D !== "undefined") {
            this.Drawer3D.Draw(this.Objects);
            var coef = this.Drawer3D.canvas.width / this.Drawer3D.canvas.height;
            if (coef > 1)
                ctx.drawImage(this.Drawer3D.canvas, 0, 0, 100*coef, 100);
            else
                ctx.drawImage(this.Drawer3D.canvas, 0, 0, 100, 100*coef);
        }
        img = cnv.toDataURL();
        var id = this.Id;
        $.ajax(
                {
                    url: element.ajaxAddress + "removeproject.php",
                    data: { param: "pid = "+ element.User.parent +" and id = "+ id },
                    type:"POST"
                }).success(function (d) {
                });
        this.Save(function(o) {
            $.ajax(
                {
                    url: element.ajaxAddress + "saveproject.php",
                    data: { data: JSON.stringify(o), parent: o.parent, name: "Кухня", id: id, img:img },
                    type:"POST"
                }).success(function(d) {
                });
        });
    },
    Save:function(howToSave) {
        var o = {
            parent: element.User.parent
        };
        o.Walls = [];
        o.Areas = [];
        this.Objects.Walls.forEach(function(a) {
            var v = {
                id: a.id,
                StartX: a.Start.X,
                StartY: a.Start.Y,
                EndX: a.End.X,
                EndY: a.End.Y,
                Config: {
                    Left: {
                        Changed: 2,
                        fill: {
                            objs: [],
                            full: {
                                color: "#bbbbbb"
                            }
                        }
                    },
                    Right: {
                        Changed: 2,
                        fill: {
                            objs: [],
                            full: {
                                color: "#bbbbbb"
                            }
                        }
                    }
                }
            };
            ['Left', 'Right'].forEach(function(index) {
                v.Config[index].fill.full.color = a.Config[index].fill.full.color;
                v.Config[index].fill.full.image = a.Config[index].fill.full.image;
                v.Config[index].fill.full.width = a.Config[index].fill.full.width;
                v.Config[index].fill.full.height = a.Config[index].fill.full.height;
                a.Config[index].fill.objs.forEach(function(b) {
                    v.Config[index].fill.objs.push({
                        PntX: b.Pnt.X,
                        PntY: b.Pnt.Y,
                        Angle: b.Angle,
                        image: b.image,
                        w: b.w,
                        h: b.h
                    });
                });
            });
            o.Walls.push(v);
        });
        howToSave(o);
    }
};


var Drawer2D = function (container) {
    container.append("<canvas mode='2d'></canvas>");
    var canvas2D = $('canvas[mode=2d]', container)[0];
    canvas2D.width = container.width();
    canvas2D.height = container.height();
    canvas2D.container = container;
    this.canvas = canvas2D;
    var $this = this;
    Drawer.call(this);
    $(element).keydown(function (e) {
        if (element.World.Drawer !== $this) return;
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
        if (typeof element.World.Crafter.walls !== 'undefined' && element.World.Crafter.walls.filter(function (d) { return d.Eq(a); }).length > 0)
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
        var last = toPnt(a.Start), $new = toPnt(a.End);
        ctx.moveTo(last.X, last.Y);
        //todo: get controlpoints
        ctx.bezierCurveTo($new.X, $new.Y, $new.X, $new.Y, $new.X, $new.Y);
        var col = currentColor || "rgba(255,182,0, 1)";
        ctx.strokeStyle = col;
        ctx.lineWidth = a.Width / $this.Scale;
        ctx.stroke();
        ctx.restore();
        drawEllipse(a.Start, 1, currentColor || '#ED6C02');
        drawEllipse(a.End, 1, currentColor || '#ED6C02');
    });

    walls.forEach(function(a) {
        var ctx = $this.canvas.getContext("2d");
        ctx.save();
        ctx.beginPath();
        var last = toPnt(a.Start), $new = toPnt(a.End);
        ctx.moveTo(last.X, last.Y);
        ctx.lineTo($new.X, $new.Y);
        var col = currentColor || "rgba(255,182,0, 1)";
        if (typeof element.World.Crafter.walls !== 'undefined' && element.World.Crafter.walls.filter(function (d) { return d.Eq(a); }).length > 0)
            col = currentColor || "rgba(237, 108, 2, 1)";
        ctx.strokeStyle = col;
        ctx.lineWidth = a.Width / $this.Scale;
        ctx.stroke();
        ctx.restore();
        drawEllipse(a.Start, 1, currentColor || '#ED6C02');
        drawEllipse(a.End, 1, currentColor || '#ED6C02');
    });
    this.End();
    if (element.World.Crafter.ResultMode) {
        var dataURL = $this.canvas.toDataURL();
        element.World.SavedResult = dataURL;
        this.DownloadCanvas(dataURL, 'result.png');
        element.World.Crafter.SetResultMode(false);
        $this.canvas.width = $this.canvas.OldWidth;
        $this.canvas.height = $this.canvas.OldHeight;
        element.World.Crafter.SetGridMode(true);
    }
};
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
        element.World.Drawer.MinScale = k;
        element.World.Drawer.Scale = k;
        element.World.Drawer.MinOffset = new Pnt(0, 0);
        element.World.Drawer.MaxOffset = new Pnt(can.Imgwidth/k, can.Imgheight/k);
    });
};
Drawer2D.prototype.setIdImage = function(id) {
    this.ImageId = parseInt(id);
};
Drawer2D.prototype.Start = function () {
    var can = this.canvas;
    if (element.World.Crafter.ResultMode) {
        can.OldWidth = can.container.width();
        can.OldHeight = can.container.height();
        can.width = can.Imgwidth;
        can.height = can.Imgheight;
        this.Scale = 1;
    }
    var ctx = can.getContext("2d");
    ctx.fillStyle = "#FEFEFE";
    ctx.fillRect(0, 0, can.width, can.height);
    if (can.Image && !element.World.Crafter.ResultMode) ctx.drawImage(can.Image, -this.Offset.X / this.Scale, -this.Offset.Y / this.Scale, can.Imgwidth / this.Scale, can.Imgheight / this.Scale);
    ctx.lineWidth = 0.1;
    // рисовалка сетки
    if (element.World.Crafter.GridMode) {
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
    if (this.Scale > this.MinScale) return;
    this.Scale *= 1.1;
};
Drawer2D.prototype.ScaleDown = function () {
    if (this.Scale < 0.05) return;
    this.Scale /= 1.1;
};
Drawer2D.prototype.MoveLeft = function () {
    if (this.Offset.X - 10 * this.Scale < this.MinOffset.X) return;
    this.Offset.X -= 10 * this.Scale;
};
Drawer2D.prototype.MoveRight = function () {
//    if (this.canvas.container.width()+this.Offset.X + 10 * this.Scale > (this.MaxOffset.X/this.Scale)) return;
    this.Offset.X += 10 * this.Scale;
};
Drawer2D.prototype.MoveUp = function () {
    if (this.Offset.Y - 10 * this.Scale < this.MinOffset.Y) return;
    this.Offset.Y -= 10 * this.Scale;
};
Drawer2D.prototype.MoveBottom = function () {
//    if (this.canvas.container.height()+this.Offset.Y + 10 * this.Scale > (this.MaxOffset.Y /this.Scale)) return;
    this.Offset.Y += 10 * this.Scale;
};


/**
 * jscolor, JavaScript Color Picker
 *
 * @version 1.4.1
 * @license GNU Lesser General Public License, http://www.gnu.org/copyleft/lesser.html
 * @author  Jan Odvarko, http://odvarko.cz
 * @created 2008-06-15
 * @updated 2013-04-08
 * @link    http://jscolor.com
 */


var jscolor = {


    dir : '', // location of jscolor directory (leave empty to autodetect)
    bindClass : 'color', // class name
    binding : true, // automatic binding via <input class="...">
    preloading : true, // use image preloading?


    install : function() {
        jscolor.addEvent(element, 'load', jscolor.init);
    },


    init : function() {
        if(jscolor.binding) {
            jscolor.bind();
        }
        if(jscolor.preloading) {
            jscolor.preload();
        }
    },


    getDir : function() {
        if(!jscolor.dir) {
            var detected = jscolor.detectDir();
            jscolor.dir = detected!==false ? detected : 'jscolor/';
        }
        return jscolor.dir;
    },


    detectDir : function() {
        var base = location.href;

        var e = document.getElementsByTagName('base');
        for(var i=0; i<e.length; i+=1) {
            if(e[i].href) { base = e[i].href; }
        }

        var e = document.getElementsByTagName('script');
        for(var i=0; i<e.length; i+=1) {
            if(e[i].src && /(^|\/)jscolor\.js([?#].*)?$/i.test(e[i].src)) {
                var src = new jscolor.URI(e[i].src);
                var srcAbs = src.toAbsolute(base);
                srcAbs.path = srcAbs.path.replace(/[^\/]+$/, ''); // remove filename
                srcAbs.query = null;
                srcAbs.fragment = null;
                return srcAbs.toString();
            }
        }
        return false;
    },


    bind : function() {
        var matchClass = new RegExp('(^|\\s)('+jscolor.bindClass+')\\s*(\\{[^}]*\\})?', 'i');
        var e = document.getElementsByTagName('input');
        for(var i=0; i<e.length; i+=1) {
            var m;
            if(!e[i].color && e[i].className && (m = e[i].className.match(matchClass))) {
                var prop = {};
                if(m[3]) {
                    try {
                        prop = (new Function ('return (' + m[3] + ')'))();
                    } catch(eInvalidProp) {}
                }
                e[i].color = new jscolor.color(e[i], prop);
            }
        }
    },


    preload : function() {
        for(var fn in jscolor.imgRequire) {
            if(jscolor.imgRequire.hasOwnProperty(fn)) {
                jscolor.loadImage(fn);
            }
        }
    },


    images : {
        pad : [ 181, 101 ],
        sld : [ 16, 101 ],
        cross : [ 15, 15 ],
        arrow : [ 7, 11 ]
    },


    imgRequire : {},
    imgLoaded : {},


    requireImage : function(filename) {
        jscolor.imgRequire[filename] = true;
    },


    loadImage : function(filename) {
        if(!jscolor.imgLoaded[filename]) {
            jscolor.imgLoaded[filename] = new Image();
            jscolor.imgLoaded[filename].src = jscolor.getDir()+filename;
        }
    },


    fetchElement : function(mixed) {
        return typeof mixed === 'string' ? document.getElementById(mixed) : mixed;
    },


    addEvent : function(el, evnt, func) {
        if(el.addEventListener) {
            el.addEventListener(evnt, func, false);
        } else if(el.attachEvent) {
            el.attachEvent('on'+evnt, func);
        }
    },


    fireEvent : function(el, evnt) {
        if(!el) {
            return;
        }
        if(document.createEvent) {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent(evnt, true, true);
            el.dispatchEvent(ev);
        } else if(document.createEventObject) {
            var ev = document.createEventObject();
            el.fireEvent('on'+evnt, ev);
        } else if(el['on'+evnt]) { // alternatively use the traditional event model (IE5)
            el['on'+evnt]();
        }
    },


    getElementPos : function(e) {
        var e1=e, e2=e;
        var x=0, y=0;
        if(e1.offsetParent) {
            do {
                x += e1.offsetLeft;
                y += e1.offsetTop;
            } while(e1 = e1.offsetParent);
        }
        while((e2 = e2.parentNode) && e2.nodeName.toUpperCase() !== 'BODY') {
            x -= e2.scrollLeft;
            y -= e2.scrollTop;
        }
        return [x, y];
    },


    getElementSize : function(e) {
        return [e.offsetWidth, e.offsetHeight];
    },


    getRelMousePos : function(e) {
        var x = 0, y = 0;
        if (!e) { e = element.event; }
        if (typeof e.offsetX === 'number') {
            x = e.offsetX;
            y = e.offsetY;
        } else if (typeof e.layerX === 'number') {
            x = e.layerX;
            y = e.layerY;
        }
        return { x: x, y: y };
    },


    getViewPos : function() {
        if(typeof element.pageYOffset === 'number') {
            return [element.pageXOffset, element.pageYOffset];
        } else if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            return [document.body.scrollLeft, document.body.scrollTop];
        } else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
        } else {
            return [0, 0];
        }
    },


    getViewSize : function() {
        if(typeof element.innerWidth === 'number') {
            return [element.innerWidth, element.innerHeight];
        } else if(document.body && (document.body.clientWidth || document.body.clientHeight)) {
            return [document.body.clientWidth, document.body.clientHeight];
        } else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            return [document.documentElement.clientWidth, document.documentElement.clientHeight];
        } else {
            return [0, 0];
        }
    },


    URI : function(uri) { // See RFC3986

        this.scheme = null;
        this.authority = null;
        this.path = '';
        this.query = null;
        this.fragment = null;

        this.parse = function(uri) {
            var m = uri.match(/^(([A-Za-z][0-9A-Za-z+.-]*)(:))?((\/\/)([^\/?#]*))?([^?#]*)((\?)([^#]*))?((#)(.*))?/);
            this.scheme = m[3] ? m[2] : null;
            this.authority = m[5] ? m[6] : null;
            this.path = m[7];
            this.query = m[9] ? m[10] : null;
            this.fragment = m[12] ? m[13] : null;
            return this;
        };

        this.toString = function() {
            var result = '';
            if(this.scheme !== null) { result = result + this.scheme + ':'; }
            if(this.authority !== null) { result = result + '//' + this.authority; }
            if(this.path !== null) { result = result + this.path; }
            if(this.query !== null) { result = result + '?' + this.query; }
            if(this.fragment !== null) { result = result + '#' + this.fragment; }
            return result;
        };

        this.toAbsolute = function(base) {
            var base = new jscolor.URI(base);
            var r = this;
            var t = new jscolor.URI;

            if(base.scheme === null) { return false; }

            if(r.scheme !== null && r.scheme.toLowerCase() === base.scheme.toLowerCase()) {
                r.scheme = null;
            }

            if(r.scheme !== null) {
                t.scheme = r.scheme;
                t.authority = r.authority;
                t.path = removeDotSegments(r.path);
                t.query = r.query;
            } else {
                if(r.authority !== null) {
                    t.authority = r.authority;
                    t.path = removeDotSegments(r.path);
                    t.query = r.query;
                } else {
                    if(r.path === '') {
                        t.path = base.path;
                        if(r.query !== null) {
                            t.query = r.query;
                        } else {
                            t.query = base.query;
                        }
                    } else {
                        if(r.path.substr(0,1) === '/') {
                            t.path = removeDotSegments(r.path);
                        } else {
                            if(base.authority !== null && base.path === '') {
                                t.path = '/'+r.path;
                            } else {
                                t.path = base.path.replace(/[^\/]+$/,'')+r.path;
                            }
                            t.path = removeDotSegments(t.path);
                        }
                        t.query = r.query;
                    }
                    t.authority = base.authority;
                }
                t.scheme = base.scheme;
            }
            t.fragment = r.fragment;

            return t;
        };

        function removeDotSegments(path) {
            var out = '';
            while(path) {
                if(path.substr(0,3)==='../' || path.substr(0,2)==='./') {
                    path = path.replace(/^\.+/,'').substr(1);
                } else if(path.substr(0,3)==='/./' || path==='/.') {
                    path = '/'+path.substr(3);
                } else if(path.substr(0,4)==='/../' || path==='/..') {
                    path = '/'+path.substr(4);
                    out = out.replace(/\/?[^\/]*$/, '');
                } else if(path==='.' || path==='..') {
                    path = '';
                } else {
                    var rm = path.match(/^\/?[^\/]*/)[0];
                    path = path.substr(rm.length);
                    out = out + rm;
                }
            }
            return out;
        }

        if(uri) {
            this.parse(uri);
        }

    },


    //
    // Usage example:
    // var myColor = new jscolor.color(myInputElement)
    //

    color : function(target, prop) {


        this.required = true; // refuse empty values?
        this.adjust = true; // adjust value to uniform notation?
        this.hash = false; // prefix color with # symbol?
        this.caps = true; // uppercase?
        this.slider = true; // show the value/saturation slider?
        this.valueElement = target; // value holder
        this.styleElement = target; // where to reflect current color
        this.onImmediateChange = null; // onchange callback (can be either string or function)
        this.hsv = [0, 0, 1]; // read-only  0-6, 0-1, 0-1
        this.rgb = [1, 1, 1]; // read-only  0-1, 0-1, 0-1
        this.minH = 0; // read-only  0-6
        this.maxH = 6; // read-only  0-6
        this.minS = 0; // read-only  0-1
        this.maxS = 1; // read-only  0-1
        this.minV = 0; // read-only  0-1
        this.maxV = 1; // read-only  0-1

        this.pickerOnfocus = true; // display picker on focus?
        this.pickerMode = 'HSV'; // HSV | HVS
        this.pickerPosition = 'bottom'; // left | right | top | bottom
        this.pickerSmartPosition = true; // automatically adjust picker position when necessary
        this.pickerButtonHeight = 20; // px
        this.pickerClosable = false;
        this.pickerCloseText = 'Close';
        this.pickerButtonColor = 'ButtonText'; // px
        this.pickerFace = 10; // px
        this.pickerFaceColor = 'ThreeDFace'; // CSS color
        this.pickerBorder = 1; // px
        this.pickerBorderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight'; // CSS color
        this.pickerInset = 1; // px
        this.pickerInsetColor = 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow'; // CSS color
        this.pickerZIndex = 10000;


        for(var p in prop) {
            if(prop.hasOwnProperty(p)) {
                this[p] = prop[p];
            }
        }


        this.hidePicker = function() {
            if(isPickerOwner()) {
                removePicker();
            }
        };


        this.showPicker = function() {
            if(!isPickerOwner()) {
                var tp = jscolor.getElementPos(target); // target pos
                var ts = jscolor.getElementSize(target); // target size
                var vp = jscolor.getViewPos(); // view pos
                var vs = jscolor.getViewSize(); // view size
                var ps = getPickerDims(this); // picker size
                var a, b, c;
                switch(this.pickerPosition.toLowerCase()) {
                    case 'left': a=1; b=0; c=-1; break;
                    case 'right':a=1; b=0; c=1; break;
                    case 'top':  a=0; b=1; c=-1; break;
                    default:     a=0; b=1; c=1; break;
                }
                var l = (ts[b]+ps[b])/2;

                // picker pos
                if (!this.pickerSmartPosition) {
                    var pp = [
                        tp[a],
                        tp[b]+ts[b]-l+l*c
                    ];
                } else {
                    var pp = [
                        -vp[a]+tp[a]+ps[a] > vs[a] ?
                            (-vp[a]+tp[a]+ts[a]/2 > vs[a]/2 && tp[a]+ts[a]-ps[a] >= 0 ? tp[a]+ts[a]-ps[a] : tp[a]) :
                            tp[a],
                        -vp[b]+tp[b]+ts[b]+ps[b]-l+l*c > vs[b] ?
                            (-vp[b]+tp[b]+ts[b]/2 > vs[b]/2 && tp[b]+ts[b]-l-l*c >= 0 ? tp[b]+ts[b]-l-l*c : tp[b]+ts[b]-l+l*c) :
                            (tp[b]+ts[b]-l+l*c >= 0 ? tp[b]+ts[b]-l+l*c : tp[b]+ts[b]-l-l*c)
                    ];
                }
                drawPicker(pp[a], pp[b]);
            }
        };


        this.importColor = function() {
            if(!valueElement) {
                this.exportColor();
            } else {
                if(!this.adjust) {
                    if(!this.fromString(valueElement.value, leaveValue)) {
                        styleElement.style.backgroundImage = styleElement.jscStyle.backgroundImage;
                        styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
                        styleElement.style.color = styleElement.jscStyle.color;
                        this.exportColor(leaveValue | leaveStyle);
                    }
                } else if(!this.required && /^\s*$/.test(valueElement.value)) {
                    valueElement.value = '';
                    styleElement.style.backgroundImage = styleElement.jscStyle.backgroundImage;
                    styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
                    styleElement.style.color = styleElement.jscStyle.color;
                    this.exportColor(leaveValue | leaveStyle);

                } else if(this.fromString(valueElement.value)) {
                    // OK
                } else {
                    this.exportColor();
                }
            }
        };


        this.exportColor = function(flags) {
            if(!(flags & leaveValue) && valueElement) {
                var value = this.toString();
                if(this.caps) { value = value.toUpperCase(); }
                if(this.hash) { value = '#'+value; }
                valueElement.value = value;
            }
            if(!(flags & leaveStyle) && styleElement) {
                styleElement.style.backgroundImage = "none";
                styleElement.style.backgroundColor =
                    '#'+this.toString();
                styleElement.style.color =
                    0.213 * this.rgb[0] +
                    0.715 * this.rgb[1] +
                    0.072 * this.rgb[2]
                    < 0.5 ? '#FFF' : '#000';
            }
            if(!(flags & leavePad) && isPickerOwner()) {
                redrawPad();
            }
            if(!(flags & leaveSld) && isPickerOwner()) {
                redrawSld();
            }
        };


        this.fromHSV = function(h, s, v, flags) { // null = don't change
            if(h !== null) { h = Math.max(0.0, this.minH, Math.min(6.0, this.maxH, h)); }
            if(s !== null) { s = Math.max(0.0, this.minS, Math.min(1.0, this.maxS, s)); }
            if(v !== null) { v = Math.max(0.0, this.minV, Math.min(1.0, this.maxV, v)); }

            this.rgb = HSV_RGB(
                h===null ? this.hsv[0] : (this.hsv[0]=h),
                s===null ? this.hsv[1] : (this.hsv[1]=s),
                v===null ? this.hsv[2] : (this.hsv[2]=v)
            );

            this.exportColor(flags);
        };


        this.fromRGB = function(r, g, b, flags) { // null = don't change
            if(r !== null) { r = Math.max(0.0, Math.min(1.0, r)); }
            if(g !== null) { g = Math.max(0.0, Math.min(1.0, g)); }
            if(b !== null) { b = Math.max(0.0, Math.min(1.0, b)); }

            var hsv = RGB_HSV(
                r===null ? this.rgb[0] : r,
                g===null ? this.rgb[1] : g,
                b===null ? this.rgb[2] : b
            );
            if(hsv[0] !== null) {
                this.hsv[0] = Math.max(0.0, this.minH, Math.min(6.0, this.maxH, hsv[0]));
            }
            if(hsv[2] !== 0) {
                this.hsv[1] = hsv[1]===null ? null : Math.max(0.0, this.minS, Math.min(1.0, this.maxS, hsv[1]));
            }
            this.hsv[2] = hsv[2]===null ? null : Math.max(0.0, this.minV, Math.min(1.0, this.maxV, hsv[2]));

            // update RGB according to final HSV, as some values might be trimmed
            var rgb = HSV_RGB(this.hsv[0], this.hsv[1], this.hsv[2]);
            this.rgb[0] = rgb[0];
            this.rgb[1] = rgb[1];
            this.rgb[2] = rgb[2];

            this.exportColor(flags);
        };


        this.fromString = function(hex, flags) {
            var m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
            if(!m) {
                return false;
            } else {
                if(m[1].length === 6) { // 6-char notation
                    this.fromRGB(
                        parseInt(m[1].substr(0,2),16) / 255,
                        parseInt(m[1].substr(2,2),16) / 255,
                        parseInt(m[1].substr(4,2),16) / 255,
                        flags
                    );
                } else { // 3-char notation
                    this.fromRGB(
                        parseInt(m[1].charAt(0)+m[1].charAt(0),16) / 255,
                        parseInt(m[1].charAt(1)+m[1].charAt(1),16) / 255,
                        parseInt(m[1].charAt(2)+m[1].charAt(2),16) / 255,
                        flags
                    );
                }
                return true;
            }
        };


        this.toString = function() {
            return (
                (0x100 | Math.round(255*this.rgb[0])).toString(16).substr(1) +
                (0x100 | Math.round(255*this.rgb[1])).toString(16).substr(1) +
                (0x100 | Math.round(255*this.rgb[2])).toString(16).substr(1)
            );
        };


        function RGB_HSV(r, g, b) {
            var n = Math.min(Math.min(r,g),b);
            var v = Math.max(Math.max(r,g),b);
            var m = v - n;
            if(m === 0) { return [ null, 0, v ]; }
            var h = r===n ? 3+(b-g)/m : (g===n ? 5+(r-b)/m : 1+(g-r)/m);
            return [ h===6?0:h, m/v, v ];
        }


        function HSV_RGB(h, s, v) {
            if(h === null) { return [ v, v, v ]; }
            var i = Math.floor(h);
            var f = i%2 ? h-i : 1-(h-i);
            var m = v * (1 - s);
            var n = v * (1 - s*f);
            switch(i) {
                case 6:
                case 0: return [v,n,m];
                case 1: return [n,v,m];
                case 2: return [m,v,n];
                case 3: return [m,n,v];
                case 4: return [n,m,v];
                case 5: return [v,m,n];
            }
        }


        function removePicker() {
            delete jscolor.picker.owner;
            document.getElementsByTagName('body')[0].removeChild(jscolor.picker.boxB);
        }


        function drawPicker(x, y) {
            if(!jscolor.picker) {
                jscolor.picker = {
                    box : document.createElement('div'),
                    boxB : document.createElement('div'),
                    pad : document.createElement('div'),
                    padB : document.createElement('div'),
                    padM : document.createElement('div'),
                    sld : document.createElement('div'),
                    sldB : document.createElement('div'),
                    sldM : document.createElement('div'),
                    btn : document.createElement('div'),
                    btnS : document.createElement('span'),
                    btnT : document.createTextNode(THIS.pickerCloseText)
                };
                for(var i=0,segSize=4; i<jscolor.images.sld[1]; i+=segSize) {
                    var seg = document.createElement('div');
                    seg.style.height = segSize+'px';
                    seg.style.fontSize = '1px';
                    seg.style.lineHeight = '0';
                    jscolor.picker.sld.appendChild(seg);
                }
                jscolor.picker.sldB.appendChild(jscolor.picker.sld);
                jscolor.picker.box.appendChild(jscolor.picker.sldB);
                jscolor.picker.box.appendChild(jscolor.picker.sldM);
                jscolor.picker.padB.appendChild(jscolor.picker.pad);
                jscolor.picker.box.appendChild(jscolor.picker.padB);
                jscolor.picker.box.appendChild(jscolor.picker.padM);
                jscolor.picker.btnS.appendChild(jscolor.picker.btnT);
                jscolor.picker.btn.appendChild(jscolor.picker.btnS);
                jscolor.picker.box.appendChild(jscolor.picker.btn);
                jscolor.picker.boxB.appendChild(jscolor.picker.box);
            }

            var p = jscolor.picker;

            // controls interaction
            p.box.onmouseup =
            p.box.onmouseout = function() { target.focus(); };
            p.box.onmousedown = function() { abortBlur=true; };
            p.box.onmousemove = function(e) {
                if (holdPad || holdSld) {
                    holdPad && setPad(e);
                    holdSld && setSld(e);
                    if (document.selection) {
                        document.selection.empty();
                    } else if (element.getSelection) {
                        element.getSelection().removeAllRanges();
                    }
                    dispatchImmediateChange();
                }
            };
            if('ontouchstart' in element) { // if touch device
                p.box.addEventListener('touchmove', function(e) {
                    var event={
                        'offsetX': e.touches[0].pageX-touchOffset.X,
                        'offsetY': e.touches[0].pageY-touchOffset.Y
                    };
                    if (holdPad || holdSld) {
                        holdPad && setPad(event);
                        holdSld && setSld(event);
                        dispatchImmediateChange();
                    }
                    e.stopPropagation(); // prevent move "view" on broswer
                    e.preventDefault(); // prevent Default - Android Fix (else android generated only 1-2 touchmove events)
                }, false);
            }
            p.padM.onmouseup =
            p.padM.onmouseout = function() { if(holdPad) { holdPad=false; jscolor.fireEvent(valueElement,'change'); } };
            p.padM.onmousedown = function(e) {
                // if the slider is at the bottom, move it up
                switch(modeID) {
                    case 0: if (THIS.hsv[2] === 0) { THIS.fromHSV(null, null, 1.0); }; break;
                    case 1: if (THIS.hsv[1] === 0) { THIS.fromHSV(null, 1.0, null); }; break;
                }
                holdSld=false;
                holdPad=true;
                setPad(e);
                dispatchImmediateChange();
            };
            if('ontouchstart' in element) {
                p.padM.addEventListener('touchstart', function(e) {
                    touchOffset={
                        'X': e.target.offsetParent.offsetLeft,
                        'Y': e.target.offsetParent.offsetTop
                    };
                    this.onmousedown({
                        'offsetX':e.touches[0].pageX-touchOffset.X,
                        'offsetY':e.touches[0].pageY-touchOffset.Y
                    });
                });
            }
            p.sldM.onmouseup =
            p.sldM.onmouseout = function() { if(holdSld) { holdSld=false; jscolor.fireEvent(valueElement,'change'); } };
            p.sldM.onmousedown = function(e) {
                holdPad=false;
                holdSld=true;
                setSld(e);
                dispatchImmediateChange();
            };
            if('ontouchstart' in element) {
                p.sldM.addEventListener('touchstart', function(e) {
                    touchOffset={
                        'X': e.target.offsetParent.offsetLeft,
                        'Y': e.target.offsetParent.offsetTop
                    };
                    this.onmousedown({
                        'offsetX':e.touches[0].pageX-touchOffset.X,
                        'offsetY':e.touches[0].pageY-touchOffset.Y
                    });
                });
            }

            // picker
            var dims = getPickerDims(THIS);
            p.box.style.width = dims[0] + 'px';
            p.box.style.height = dims[1] + 'px';

            // picker border
            p.boxB.style.position = 'absolute';
            p.boxB.style.clear = 'both';
            p.boxB.style.left = x+'px';
            p.boxB.style.top = y+'px';
            p.boxB.style.zIndex = THIS.pickerZIndex;
            p.boxB.style.border = THIS.pickerBorder+'px solid';
            p.boxB.style.borderColor = THIS.pickerBorderColor;
            p.boxB.style.background = THIS.pickerFaceColor;

            // pad image
            p.pad.style.width = jscolor.images.pad[0]+'px';
            p.pad.style.height = jscolor.images.pad[1]+'px';

            // pad border
            p.padB.style.position = 'absolute';
            p.padB.style.left = THIS.pickerFace+'px';
            p.padB.style.top = THIS.pickerFace+'px';
            p.padB.style.border = THIS.pickerInset+'px solid';
            p.padB.style.borderColor = THIS.pickerInsetColor;

            // pad mouse area
            p.padM.style.position = 'absolute';
            p.padM.style.left = '0';
            p.padM.style.top = '0';
            p.padM.style.width = THIS.pickerFace + 2*THIS.pickerInset + jscolor.images.pad[0] + jscolor.images.arrow[0] + 'px';
            p.padM.style.height = p.box.style.height;
            p.padM.style.cursor = 'crosshair';

            // slider image
            p.sld.style.overflow = 'hidden';
            p.sld.style.width = jscolor.images.sld[0]+'px';
            p.sld.style.height = jscolor.images.sld[1]+'px';

            // slider border
            p.sldB.style.display = THIS.slider ? 'block' : 'none';
            p.sldB.style.position = 'absolute';
            p.sldB.style.right = THIS.pickerFace+'px';
            p.sldB.style.top = THIS.pickerFace+'px';
            p.sldB.style.border = THIS.pickerInset+'px solid';
            p.sldB.style.borderColor = THIS.pickerInsetColor;

            // slider mouse area
            p.sldM.style.display = THIS.slider ? 'block' : 'none';
            p.sldM.style.position = 'absolute';
            p.sldM.style.right = '0';
            p.sldM.style.top = '0';
            p.sldM.style.width = jscolor.images.sld[0] + jscolor.images.arrow[0] + THIS.pickerFace + 2*THIS.pickerInset + 'px';
            p.sldM.style.height = p.box.style.height;
            try {
                p.sldM.style.cursor = 'pointer';
            } catch(eOldIE) {
                p.sldM.style.cursor = 'hand';
            }

            // "close" button
            function setBtnBorder() {
                var insetColors = THIS.pickerInsetColor.split(/\s+/);
                var pickerOutsetColor = insetColors.length < 2 ? insetColors[0] : insetColors[1] + ' ' + insetColors[0] + ' ' + insetColors[0] + ' ' + insetColors[1];
                p.btn.style.borderColor = pickerOutsetColor;
            }
            p.btn.style.display = THIS.pickerClosable ? 'block' : 'none';
            p.btn.style.position = 'absolute';
            p.btn.style.left = THIS.pickerFace + 'px';
            p.btn.style.bottom = THIS.pickerFace + 'px';
            p.btn.style.padding = '0 15px';
            p.btn.style.height = '18px';
            p.btn.style.border = THIS.pickerInset + 'px solid';
            setBtnBorder();
            p.btn.style.color = THIS.pickerButtonColor;
            p.btn.style.font = '12px sans-serif';
            p.btn.style.textAlign = 'center';
            try {
                p.btn.style.cursor = 'pointer';
            } catch(eOldIE) {
                p.btn.style.cursor = 'hand';
            }
            p.btn.onmousedown = function () {
                THIS.hidePicker();
            };
            p.btnS.style.lineHeight = p.btn.style.height;

            // load images in optimal order
            switch(modeID) {
                case 0: var padImg = 'hs.png'; break;
                case 1: var padImg = 'hv.png'; break;
            }
            p.padM.style.backgroundImage = "url('"+jscolor.getDir()+"cross.gif')";
            p.padM.style.backgroundRepeat = "no-repeat";
            p.sldM.style.backgroundImage = "url('"+jscolor.getDir()+"arrow.gif')";
            p.sldM.style.backgroundRepeat = "no-repeat";
            p.pad.style.backgroundImage = "url('"+jscolor.getDir()+padImg+"')";
            p.pad.style.backgroundRepeat = "no-repeat";
            p.pad.style.backgroundPosition = "0 0";

            // place pointers
            redrawPad();
            redrawSld();

            jscolor.picker.owner = THIS;
            document.getElementsByTagName('body')[0].appendChild(p.boxB);
        }


        function getPickerDims(o) {
            var dims = [
                2*o.pickerInset + 2*o.pickerFace + jscolor.images.pad[0] +
                    (o.slider ? 2*o.pickerInset + 2*jscolor.images.arrow[0] + jscolor.images.sld[0] : 0),
                o.pickerClosable ?
                    4*o.pickerInset + 3*o.pickerFace + jscolor.images.pad[1] + o.pickerButtonHeight :
                    2*o.pickerInset + 2*o.pickerFace + jscolor.images.pad[1]
            ];
            return dims;
        }


        function redrawPad() {
            // redraw the pad pointer
            switch(modeID) {
                case 0: var yComponent = 1; break;
                case 1: var yComponent = 2; break;
            }
            var x = Math.round((THIS.hsv[0]/6) * (jscolor.images.pad[0]-1));
            var y = Math.round((1-THIS.hsv[yComponent]) * (jscolor.images.pad[1]-1));
            jscolor.picker.padM.style.backgroundPosition =
                (THIS.pickerFace+THIS.pickerInset+x - Math.floor(jscolor.images.cross[0]/2)) + 'px ' +
                (THIS.pickerFace+THIS.pickerInset+y - Math.floor(jscolor.images.cross[1]/2)) + 'px';

            // redraw the slider image
            var seg = jscolor.picker.sld.childNodes;

            switch(modeID) {
                case 0:
                    var rgb = HSV_RGB(THIS.hsv[0], THIS.hsv[1], 1);
                    for(var i=0; i<seg.length; i+=1) {
                        seg[i].style.backgroundColor = 'rgb('+
                            (rgb[0]*(1-i/seg.length)*100)+'%,'+
                            (rgb[1]*(1-i/seg.length)*100)+'%,'+
                            (rgb[2]*(1-i/seg.length)*100)+'%)';
                    }
                    break;
                case 1:
                    var rgb, s, c = [ THIS.hsv[2], 0, 0 ];
                    var i = Math.floor(THIS.hsv[0]);
                    var f = i%2 ? THIS.hsv[0]-i : 1-(THIS.hsv[0]-i);
                    switch(i) {
                        case 6:
                        case 0: rgb=[0,1,2]; break;
                        case 1: rgb=[1,0,2]; break;
                        case 2: rgb=[2,0,1]; break;
                        case 3: rgb=[2,1,0]; break;
                        case 4: rgb=[1,2,0]; break;
                        case 5: rgb=[0,2,1]; break;
                    }
                    for(var i=0; i<seg.length; i+=1) {
                        s = 1 - 1/(seg.length-1)*i;
                        c[1] = c[0] * (1 - s*f);
                        c[2] = c[0] * (1 - s);
                        seg[i].style.backgroundColor = 'rgb('+
                            (c[rgb[0]]*100)+'%,'+
                            (c[rgb[1]]*100)+'%,'+
                            (c[rgb[2]]*100)+'%)';
                    }
                    break;
            }
        }


        function redrawSld() {
            // redraw the slider pointer
            switch(modeID) {
                case 0: var yComponent = 2; break;
                case 1: var yComponent = 1; break;
            }
            var y = Math.round((1-THIS.hsv[yComponent]) * (jscolor.images.sld[1]-1));
            jscolor.picker.sldM.style.backgroundPosition =
                '0 ' + (THIS.pickerFace+THIS.pickerInset+y - Math.floor(jscolor.images.arrow[1]/2)) + 'px';
        }


        function isPickerOwner() {
            return jscolor.picker && jscolor.picker.owner === THIS;
        }


        function blurTarget() {
            if(valueElement === target) {
                THIS.importColor();
            }
            if(THIS.pickerOnfocus) {
                THIS.hidePicker();
            }
        }


        function blurValue() {
            if(valueElement !== target) {
                THIS.importColor();
            }
        }


        function setPad(e) {
            var mpos = jscolor.getRelMousePos(e);
            var x = mpos.x - THIS.pickerFace - THIS.pickerInset;
            var y = mpos.y - THIS.pickerFace - THIS.pickerInset;
            switch(modeID) {
                case 0: THIS.fromHSV(x*(6/(jscolor.images.pad[0]-1)), 1 - y/(jscolor.images.pad[1]-1), null, leaveSld); break;
                case 1: THIS.fromHSV(x*(6/(jscolor.images.pad[0]-1)), null, 1 - y/(jscolor.images.pad[1]-1), leaveSld); break;
            }
        }


        function setSld(e) {
            var mpos = jscolor.getRelMousePos(e);
            var y = mpos.y - THIS.pickerFace - THIS.pickerInset;
            switch(modeID) {
                case 0: THIS.fromHSV(null, null, 1 - y/(jscolor.images.sld[1]-1), leavePad); break;
                case 1: THIS.fromHSV(null, 1 - y/(jscolor.images.sld[1]-1), null, leavePad); break;
            }
        }


        function dispatchImmediateChange() {
            if (THIS.onImmediateChange) {
                var callback;
                if (typeof THIS.onImmediateChange === 'string') {
                    callback = new Function (THIS.onImmediateChange);
                } else {
                    callback = THIS.onImmediateChange;
                }
                callback.call(THIS);
            }
        }


        var THIS = this;
        var modeID = this.pickerMode.toLowerCase()==='hvs' ? 1 : 0;
        var abortBlur = false;
        var
            valueElement = jscolor.fetchElement(this.valueElement),
            styleElement = jscolor.fetchElement(this.styleElement);
        var
            holdPad = false,
            holdSld = false,
            touchOffset = {};
        var
            leaveValue = 1<<0,
            leaveStyle = 1<<1,
            leavePad = 1<<2,
            leaveSld = 1<<3;

        // target
        jscolor.addEvent(target, 'focus', function() {
            if(THIS.pickerOnfocus) { THIS.showPicker(); }
        });
        jscolor.addEvent(target, 'blur', function() {
            if(!abortBlur) {
                element.setTimeout(function(){ abortBlur || blurTarget(); abortBlur=false; }, 0);
            } else {
                abortBlur = false;
            }
        });

        // valueElement
        if(valueElement) {
            var updateField = function() {
                THIS.fromString(valueElement.value, leaveValue);
                dispatchImmediateChange();
            };
            jscolor.addEvent(valueElement, 'keyup', updateField);
            jscolor.addEvent(valueElement, 'input', updateField);
            jscolor.addEvent(valueElement, 'blur', blurValue);
            valueElement.setAttribute('autocomplete', 'off');
        }

        // styleElement
        if(styleElement) {
            styleElement.jscStyle = {
                backgroundImage : styleElement.style.backgroundImage,
                backgroundColor : styleElement.style.backgroundColor,
                color : styleElement.style.color
            };
        }

        // require images
        switch(modeID) {
            case 0: jscolor.requireImage('hs.png'); break;
            case 1: jscolor.requireImage('hv.png'); break;
        }
        jscolor.requireImage('cross.gif');
        jscolor.requireImage('arrow.gif');

        this.importColor();
    }

};


jscolor.install();



//Filename : NumberFormat.js
//NumberFormatter V1.0

//Author: Luc Veronneau 
//Email: hurlemonde@hotmail.com

//This script is release under The Code Project Open License (CPOL) 
//see: http://www.codeproject.com/info/cpol10.aspx
//Under no circomstances remove or modify this header

(function () {

    //Declaring namespace
    var _formatting = element.Formatting = {};
    _formatting.__namespace = true;

    //Enum representing negative patterns used by .net
    var _numberNegativePattern = _formatting.NumberNegativePattern = {
        //Negative is reprensented by enclosing parentheses ex: (1500) corresponds to -1500
        Pattern0: 0,
        //Negative is represented by leading "-"
        Pattern1: 1,
        //Negative is represented by leading "- "
        Pattern2: 2,
        //Negative is represented by following "-"
        Pattern3: 3,
        //Negative is represented by following " -"
        Pattern4: 4
    };

    var _numberFormatInfo = _formatting.NumberFormatInfo = function () {
        ///<summary>Information class passed to the NumberFormat class to be used to format text for numbers properly</summary>
        ///<returns type="Formatting.NumberFormatInfo" />
        if (arguments.length === 1) {
            for (var item in this) {
                if (typeof this[item] != "function") {
                    if (typeof this[item] != typeof arguments[0][item])
                        throw "Argument does not match NumberFormatInfo";
                }
            }
            return arguments[0];
        }
    };

    _numberFormatInfo.prototype = {
        //Negative sign property
        NegativeSign: "-",
        //Default number of digits used by the numberformat
        NumberDecimalDigits: 2,
        //Seperator used to seperate digits from integers
        NumberDecimalSeparator: ",",
        //Seperator used to split integer groups (ex: official US formatting of a number is 1,150.50 where "," if the group seperator)
        NumberGroupSeparator: "",
        //Group sizes originally an array in .net but normally groups numbers are either by 3 or not grouped at all
        NumberGroupSizes: 3,
        //Negative patterns used by .net
        NumberNegativePattern: Formatting.NumberNegativePattern.Pattern1
    };
    _numberFormatInfo.__class = true;
})();

(function () {

    //Main constructor for the NumberFormatter
    var _numberFormatter = element.Formatting.NumberFormatter = function (formatInfo) {
        ///<summary> Manages number formatting using format infos </summary>
        ///<param name="formatInfo" type="Formatting.NumberFormatInfo" />
        this.FormatInfo = formatInfo;

        var groupSeperatorReg = this.GetRegexPartForChar(this.FormatInfo.NumberGroupSeparator);
        this.GroupSeperatorReg = new RegExp(groupSeperatorReg,"g");

        var decimalSeperator = this.GetRegexPartForChar(this.FormatInfo.NumberDecimalSeparator);
        this.DecimalSeperatorReg = new RegExp(decimalSeperator,"g");

        //Creating regex from the format info to validate input text
        var str = "";
//        if (this.FormatInfo.NumberGroupSeparator != null
//            && this.FormatInfo.NumberGroupSeparator.length > 0) {
//            //The group seperator regex must take into account the possibility of having incomplete groups at the beginning 
//            //once complete, this regex part should look like (\d{1,3}){0,1}
//            str += "(\\d{1," + this.FormatInfo.NumberGroupSizes.toString() + "}){0,1}";
//            str += "(" + groupSeperatorReg + "\\d{" + this.FormatInfo.NumberGroupSizes.toString() + "}){0,}";
//        }
//        else {
            str += "(\\d+)";
//        }
        str += "(" + decimalSeperator+ "\\d+)?";
        this.BaseRegexText = str;
        str = "^" + str + "$";
        this.NumberTester = new RegExp(str);

    };

    //Prototype for the NumberFormatter class
    _numberFormatter.prototype = {
        //FormatInfo property containing localized number informations
        FormatInfo: new Formatting.NumberFormatInfo(),
        //Regex used to validate text prior to parsing
        NumberTester: new RegExp(),
        //Base regex used to concatenate with other regex
        BaseRegexText: "",
        //Regex used to find decimal seperator
        DecimalSeperatorReg : new RegExp(),
        //Regex used to find group seperator
        GroupSeperatorReg : new RegExp(),
        Parse: function (value) {
            ///<summary>Parses a string and converts it to numeric, throws if the format is wrong</summary>
            ///<param name="value" type="string" />
            ///<returns type="Number" />
            return this.TryParse(value, function (errormessage, val) {
                throw errormessage + "ArgumentValue:" + val;
            });
        },
        TryParse: function (value, parseFailure) {
            ///<summary>Parses a string and converts it to numeric and calls a method if validation fails</summary>
            ///<param name="value" type="string">The value to parse</param>
            ///<param name="parseFailure" type="function">A function(ErrorMessage, parsedValue) delegate to call if the string does not respect the format</param>
            ///<returns type="Number" />
            if (!isNaN(parseFloat(value)) && isFinite(value)) return value;
            var isNegative = this.GetNegativeRegex().test(value);
            var val = value;
            if (isNegative)
                val = this.GetNegativeRegex().exec(value)[1];

            if (!this.NumberTester.test(val)) {
                parseFailure("The number passed as argument does not respect the correct culture format.", val);
                return null;
            }

            var matches = this.NumberTester.exec(val);
            var decLen = 0;
            if (matches[matches.length - 1]!==undefined) {
                decLen = matches[matches.length - 1].length - 1;
            } 

            var partial = val.replace(this.GroupSeperatorReg, "").replace(this.DecimalSeperatorReg, "");

            if (isNegative)
                partial = "-" + partial;
            
            return (parseInt(partial) / (Math.pow(10,decLen)));
        },
        ToString: function (value) {
            ///<summary>Converts a number to string</summary>
            ///<param name="value" type="Number" />
            ///<returns type="String" />
            var result = "";
            var isNegative = false;
            if (value < 0)
                isNegative = true;

            var baseString = value.toString();
            //Remove the default negative sign
            baseString = baseString.replace("-", "");

            //Split digits from integers
            var values = baseString.split(".");

            //Fetch integers and digits
            var ints = values[0];
            var digits = "";
            if (values.length > 1)
                digits = values[1];

            //Format the left part of the number according to grouping char and size
            if (this.FormatInfo.NumberGroupSeparator != null
                && this.FormatInfo.NumberGroupSeparator.length > 0) {

                //Verifying if a first partial group is present
                var startLen = ints.length % this.FormatInfo.NumberGroupSizes;
                if (startLen == 0 && ints.length > 0)
                    startLen = this.FormatInfo.NumberGroupSizes;
                //Fetching the total number of groups
                var numberOfGroups = Math.ceil(ints.length / this.FormatInfo.NumberGroupSizes);
                //If only one, juste assign the value 
                if (numberOfGroups == 1) {
                    result += ints;
                }
                else {
                    // More than one group
                    //If a startlength is present, assign it so the rest of the string is a multiple of the group size
                    if (startLen > 0) {
                        result += ints.substring(0, startLen);
                        ints = ints.slice(-(ints.length - startLen));
                    }
                    //Group up the rest of the integers into their full groups
                    while (ints.length > 0) {
                        result += this.FormatInfo.NumberGroupSeparator + ints.substring(0, this.FormatInfo.NumberGroupSizes);
                        if (ints.length == this.FormatInfo.NumberGroupSizes)
                            break;
                        ints = ints.slice(-(ints.length - this.FormatInfo.NumberGroupSizes));
                    }
                }
            }
            else
                result += ints; //Left part is not grouped

            //If digits are present, concatenate them
            if (digits.length > 0)
                result += this.FormatInfo.NumberDecimalSeparator + digits;

            //If number is negative, decorate the number with the negative sign
            if (isNegative)
                result = this.FormatNegative(result);

            return result;
        },
        GetRegexPartForChar: function (part) {
            switch (part.charCodeAt(0)) {
                case 160:
                case 32:
                    return "[\\s\\xa0]";
                case 46:
                    return "[\\.]";
                default:
                    return "[" + part + "]";
            }
        },
        GetNegativeRegex: function () {
            ///<summary>Method creating a regex used to test if a number is negative or not</summary>
            ///<returns type="RegExp" />
            switch (this.FormatInfo.NumberNegativePattern) {
                case 0:
                    return new RegExp("^[(](" + this.BaseRegexText + ")[)]$");
                case 1:
                    return new RegExp("^" + this.FormatInfo.NegativeSign + "(" + this.BaseRegexText + ")$");
                case 2:
                    return new RegExp("^[" + this.FormatInfo.NegativeSign + " ](" + this.BaseRegexText + ")$");
                case 3:
                    return new RegExp("^(" + this.BaseRegexText + ")[-]$");
                case 4:
                    return new RegExp("^(" + this.BaseRegexText + ")[\s][-]$");
                default:
                    return null;
            }
        },
        FormatNegative: function (numberString) {
            ///<summary>Method used to format an unsigned string into un negative localized number</summary>
            ///<returns type="String" />
            switch (this.FormatInfo.NumberNegativePattern) {
                case 0:
                    return "(" + numberString + ")";
                case 1:
                    return this.FormatInfo.NegativeSign + numberString;
                case 2:
                    return this.FormatInfo.NegativeSign + " " + numberString;
                case 3:
                    return numberString + "-";
                case 4:
                    return numberString + " -";
                default:
                    return null;
            }
        }
    };
    _numberFormatter.__class = true;
})();

var ind = 0;
var Wall = function (start, end) {
    this.id = ind++;
    this.Start = start;
    this.End = end;
    this.Width = element.Config.Wall.width;
    this.Height = element.Config.Wall.height;
    this.Config = { Left: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } }, Right: { Changed: 2, fill: { objs: [], full: { color: "#ffffff" } } } };
    element.updated = true;
};
Wall.prototype = {
    constructor: Wall,
    type : "wall"
};
Wall.prototype.IsOn = function(pnt) {
    var ch = function(one, two) {
        return Math.abs(one - two) < 1;
    };
    var minX = Math.min(this.Start.X, this.End.X);
    var minY = Math.min(this.Start.Y, this.End.Y);
    var maxX = Math.max(this.Start.X, this.End.X);
    var maxY = Math.max(this.Start.Y, this.End.Y);
    if (pnt.X < minX || pnt.X > maxX || pnt.Y < minY || pnt.Y > maxY) return false;
    if (maxX == minX)
        return ch(maxX, pnt.X);
    if (maxY == minY)
        return ch(maxY, pnt.Y);
    var alpha = (maxY - minY) / (maxX - minX);
    var b = this.End.Y - alpha * this.End.X;
    return ch(alpha*pnt.X + b, pnt.Y);
};
Wall.prototype.Eq = function(wall) {
    return this.Start.length(wall.Start) == 0 && this.End.length(wall.End) == 0;
};
function AddWheel(elem, onW) {
    var onWheel = function (e) {
        e = e || element.event;
        var deltaY = e.deltaY || e.detail || e.wheelDeltaY;
        var deltaX = e.deltaX || e.detail || e.wheelDeltaX;
        if (deltaX || deltaY)
            onW({ x: deltaX, y: deltaY });
        else
            onW({ x: 0, y: e.wheelDelta });
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    };
    if (elem.addEventListener) {
        if ('onwheel' in document) {
            // IE9+, FF17+
            elem.addEventListener("wheel", function (r) {
                onWheel({ deltaX: -r.deltaX, deltaY: -r.deltaY });
            }, false);
        } else if ('onmousewheel' in document) {
            elem.addEventListener("mousewheel", onWheel, false);
        } else {
            elem.addEventListener("MozMousePixelScroll", onWheel, false);
        }
    } else { // IE<9
        elem.attachEvent("onmousewheel", onWheel);
    }
}
            element = element;
            element.EmptyImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
            element.minimimumOpacity = 0.1;
            element.headerHeight = 100;
            element.Config = {
                Wall: { height: 2.5 * 100, width: 2 }
            };
            var formatter = new Formatting.NumberFormatter(new Formatting.NumberFormatInfo());
            function onelementResize() {
                $('.leftMenu').css("height", element.headerHeight);
                $('.leftMenu .logo').css("height", element.headerHeight);
                $('.leftMenu .photo img').css("height", element.headerHeight*0.70);
                $('.leftMenu .button').css("padding-top", element.headerHeight / 3);
                $('.leftMenu .button').css("height", 2 * element.headerHeight / 3);
                $('.buttons').css("top", element.headerHeight);
                $('.designer-block').css("margin-left", 75);
                $('.designer-block').height(600);
                $('.designer-block').css("margin-top", element.headerHeight);
                $('.designer-block').css("margin-right", 30);
                $('.buttons').height(525);
                $('.propertyPanel').height($('html').height() - element.headerHeight - 3);
                if (typeof World !== "undefined") {
                    if (typeof World.Drawer2D !== "undefined") {
                        World.Drawer2D.canvas.height = $('.designer-block').height() - 120;
                        World.Drawer2D.canvas.width = $('.designer').width();
                    }
                }
            }
            var Meths = {
                resettool: function () {
                    element.World.Objects.Walls = [];
                    element.World.Objects.Beziers = [];
                    element.World.Objects.Normals = [];
                    return false;
                },
                backtool: function () {
                    element.World.Crafter.KeyDown(27);
                    return false;
                },
                benttool: function () {
                    if (element.World.Crafter instanceof WallCrafter) element.World.Crafter.SetBentMode();
                },
                linetool: function() {
                    if (element.World.Crafter instanceof WallCrafter) element.World.Crafter.SetLineMode();
                },
                beziertool: function() {
                    if (element.World.Crafter instanceof WallCrafter) element.World.Crafter.SetBezierMode();
                },
                walltool: function () {
                    if (element.World.Crafter instanceof WallCrafter) element.World.Crafter.SetWallMode();
                },
            };

        
        $(document).ready(function () {
            element.quality = 30;
            var createDef = function () {
                element.World = new WorldClass($('.designer'));
                element.minimimumOpacity = 0.1;
                onelementResize();
                element.World.Crafter = new Move2DCrafter();
                $('.buttons.d2d').css('display', 'block');
                element.World.SetMode(element.Modes.two);
                element.World.Drawer2D.setImage($('img.ge_taskImg').get(0));
            };
            createDef();
            $('.designer')[0].oncontextmenu = function () { return false; };
            element.addEventListener('resize', onelementResize, false);
            element.World.Crafter = new WallCrafter();
            onelementResize();
            $('[rel=benttool]').addClass('active');
            $('.designer .controls').mousedown(function (event) {
                if (event.stopPropagation)
                    event.stopPropagation();
            });
            $('.designer .controls .left').mousedown(function (e) {
                element.World.Drawer.MoveLeft();
            });
            $('.designer .controls .right').mousedown(function (e) {
                element.World.Drawer.MoveRight();
            });
            $('.designer .controls .up').mousedown(function (e) {
                element.World.Drawer.MoveUp();
            });
            $('.designer .controls .down').mousedown(function (e) {
                element.World.Drawer.MoveBottom();
            });
            $('.designer .controls .zoom-in').mousedown(function (e) {
                element.World.Drawer.ScaleDown();
            });
            $('.designer .controls .zoom-out').mousedown(function (e) {
                element.World.Drawer.ScaleUp();
            });
            $('.buttons div').click(function () {
                if ($(this).hasClass('tool')) {
                    $('.buttons div').removeClass('active');
                    $(this).addClass('active');
                }
                var tool = $(this).attr('rel');
                Meths[tool]();
            });
            $('.ge_gridMode').click(function () {
                var gridMode = element.World.Crafter.GetGridMode();
                $(this).text(!gridMode?"Убрать сетку":"Показать сетку");
                if (element.World.Crafter instanceof WallCrafter) element.World.Crafter.SetGridMode(!gridMode);
            });
            $('#workzone').on('click', '.ge_drawerButtons .ge_drawBottomLine', function () {
                $('.ge_drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('.ge_drawerButtons .ge_saveResult').show();
                if (element.World.Crafter instanceof WallCrafter) element.World.Crafter.SetPlotMode(true);
            });
            $('#workzone').on('click', '.ge_drawerButtons .ge_drawLayers', function () {
                $('.ge_drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('.ge_drawerButtons .ge_saveResult').hide();
                if (element.World.Crafter instanceof WallCrafter) element.World.Crafter.SetPlotMode(false);
            });
            $('#workzone').on('click', '.ge_drawerButtons .ge_saveResult', function () {
                if (element.World.Crafter instanceof WallCrafter) element.World.Crafter.SetResultMode(true);
                element.World.Draw();
                $('.ge_gridMode').text("Убрать сетку");
            });
            $('.ge_task').click(function () {
                $('.ge_errorModal .modal-title').text('Ваше задание');
                $('.ge_errorModal').modal('show');
            });

            $( "#workzone" ).mouseout(function() {
                console.log("mouse OUT!");
                $("body").css("overflow","auto");             
               // $( "#log" ).append( "Handler for .mouseout() called." );
            });

            $( "#workzone" ).mouseover(function() {
                console.log("mouse IN!"); 
                $("body").css("overflow","hidden")    
            });
        });
        var getResult = function() {
            return element.World.SavedResult;
        };




    //console.log("lol");

    /*function get_student_picture(){
        var canvas = $('.designer canvas').get(0);
        console.log(canvas);
        var dataURL = canvas.toDataURL();
        return dataURL;
    }

    function success_func(result) {
        //console.log("Количество баллов: " + result.correct/result.weight*100 + " ОТВЕТОВ: " + result.attempts);
        //$('.attempts', element).text(result.attempts);
        $(element).find('.weight').html('Набрано баллов: <me-span class="points"></span>');
        $('.points', element).text(result.points );
    };*/


    /*function success_save(result){
        var span = document.createElement('span');
        span.innerHTML = 'Сохранено';
        span.classList.add('saved');
        element.getElementsByClassName('action')[0].appendChild(span);
        setTimeout(function(){element.getElementsByClassName('saved')[0].parentNode.removeChild(element.getElementsByClassName('saved')[0])}, 1000);        
    };*/

    /*function success_check(result){
        console.log("success_check");*/
       /* $.ajax({
            type: "POST",
            url: handlerUrl,
            data: '',
            success: success_func
        });    */
    /*};*/

    var handlerUrl = runtime.handlerUrl(element, 'student_submit');

    $(element).find('.Check').bind('click', function() {
       var student_picture = get_student_picture();
       console.log("get_student_picture: " + student_picture);
        
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({picture: student_picture }),
            success: success_func
        });

    });

}