var SimpleCrafter = function () {
    Crafter.call(this);
};
SimpleCrafter.prototype = new Crafter();
SimpleCrafter.prototype.ProcessCommand = function (cmd) {
    switch (cmd.type) {
        case "dbl":
            if (typeof cmd.point === "undefined") return;
            this.DblClick(cmd.point);
            break;
        case "down":
            if (cmd.rightButton)
                break;
            this.MouseDown(cmd.point);
            break;
        case "up":
            if (typeof cmd.point === "undefined") return;
            this.MouseUp(cmd.point);
            break;
        case "move":
            if (typeof cmd.point === "undefined") return;
            this.MouseMove(cmd.point);
            break;
        case "keydown":
            this.KeyDown(cmd.key);
            break;
        case "keyup":
            this.KeyUp(cmd.key);
            break;
        default:
            break;
    }
};
SimpleCrafter.prototype.KeyDown = function (key) {
};
SimpleCrafter.prototype.KeyUp = function (key) {
};
SimpleCrafter.prototype.MouseDown = function(point) {
};
SimpleCrafter.prototype.MouseUp = function (point) {
};
SimpleCrafter.prototype.MouseMove = function (point) {
};
SimpleCrafter.prototype.DblClick = function (point) {
};