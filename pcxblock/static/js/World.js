window.Modes = { two: '2d', three: '3d', guide: 'guide'};
var parentness = {};
window.WorldClass = function (container) {
    this.Id = new Guid().Value;
    this.Objects = {
        Walls: [],
        Normals: [],
        Beziers: [],
        Curves:[],
        Arcs: [],
        Ruler: {},
        LinkPoints: [],
        TempLinkPoint:{},
        SavedResult:''
    };
    this.Events = [];
    this.UndoedEvents = [];
    this.mode = window.Modes.two;
    this.leftMouse = false;
    this.rightMouse = false;
    if (typeof container !== "undefined") {
        this.Drawer2D = new Drawer2D(container);
        this.SetMode(this.mode);
        this.Behaviour = new Behaviour(container[0]);
        var pressedKeys = [];
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
            setInterval(function () {
                $this.Draw();
            }, d);
        };
        for (var i = 0; i < cnt; ++i) {
            setTimeout(dr, d/cnt * i);
        }
    }
};

window.WorldClass.prototype = {
    constructor: window.WorldClass,
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
        if (mode === window.Modes.two) {
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
            window.localStorage.setItem("saved", JSON.stringify(o));
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
                    url: window.ajaxAddress + "removeproject.php",
                    data: { param: "pid = "+ window.User.parent +" and id = "+ id },
                    type:"POST"
                }).success(function (d) {
                });
        this.Save(function(o) {
            $.ajax(
                {
                    url: window.ajaxAddress + "saveproject.php",
                    data: { data: JSON.stringify(o), parent: o.parent, name: "Кухня", id: id, img:img },
                    type:"POST"
                }).success(function(d) {
                });
        });
    },
    Save:function(howToSave) {
        var o = {
            parent: window.User.parent
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
