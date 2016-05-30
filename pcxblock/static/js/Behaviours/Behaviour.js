var Behaviour = function (canvas) {
    this.ind = 0;
    this.listeners = [];
    this.canvas = canvas;
    var $this = this;
    this.Work = true;
    $(canvas).dblclick(function (e) {
        var parentOffset = $(e.target).parent().offset();
        var relX = e.pageX - parentOffset.left;
        var relY = e.pageY - parentOffset.top;
        if (!$this.Work) return;
        if (e.originalEvent.defaultPrevented)
            return;
        $this.Raise({ type: "dblclick", data: { X: relX, Y: relY } });
        e.preventDefault();
    });
    $(canvas).mousedown(function (e) {
        var parentOffset = $(e.target).parent().offset();
        var relX = e.pageX - parentOffset.left;
        var relY = e.pageY - parentOffset.top;
        if (!$this.Work) return;
        if (e.originalEvent.defaultPrevented)
            return;
        $this.Raise({ type: "mousedown", data: { X: relX, Y: relY, leftButton: e.button === 0, rightButton: e.button === 2 } });
        e.preventDefault();
        });
    $(canvas).mouseup(function (e) {
        var parentOffset = $(e.target).parent().offset();
        var relX = e.pageX - parentOffset.left;
        var relY = e.pageY - parentOffset.top;
        if (!$this.Work) return;
        if (e.originalEvent.defaultPrevented)
            return;
        $this.Raise({ type: "mouseup", data: { X: relX, Y: relY, leftButton: e.button === 0, rightButton: e.button === 2 } });
        e.preventDefault();
    });
    $(window).keydown(function (e) {
        if (!$this.Work) return;
        if (e.originalEvent.defaultPrevented)
            return;
        $this.Raise({
            type: "keydown", data: {
                key: e.keyCode
        } });
    });
    $(window).keyup(function (e) {
        if (!$this.Work) return;
        if (e.originalEvent.defaultPrevented)
            return;
        $this.Raise({
            type: "keyup", data: {
                key: e.keyCode
            }
        });
    });
    $(canvas).mousemove(function (e) {
        var parentOffset = $(e.target).parent().offset();
        var relX = e.pageX - parentOffset.left;
        var relY = e.pageY - parentOffset.top;
        if (!$this.Work) return;
        if (e.originalEvent.defaultPrevented || e.isDefaultPrevented())
            return;
        var btn = e.buttons || e.button;
        $this.Raise({ type: "mousemove", data: { X: relX, Y: relY, leftButton: btn === 0, rightButton: btn === 2 } });
        e.preventDefault();
    });
    AddWheel(canvas, function(e) {
        $this.Raise({ type: "scroll", data: { Z: e.y } });
    });
};
Behaviour.prototype = {
    Subscribe: function (act) {
        if (typeof act !== "function")
            throw "Allowed to subscribe only by functions";
        this.ind++;
        var key = "list" + this.ind;
        this.listeners[key] = act;
        return key;
    },
    Raise: function(cmd) {
        for (var ind in this.listeners) {
            var list = this.listeners[ind];
            if (typeof list !== "function") continue;
            list(cmd);
        }
    },
    UnSubscribe: function (ind) {
        if (typeof ind === "function") {
            for (var i in this.listeners) {
                if (this.listeners[i] === ind)
                    delete this.listeners[ind];
            }
        } else
            delete this.listeners[ind];
    }
};
