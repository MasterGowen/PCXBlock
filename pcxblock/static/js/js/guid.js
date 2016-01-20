var Guid = function() {
    this.Value = "";
    for (var i = 0; i < 36; ++i) {
        if (Guid.prototype.Empty[i] === '-')
            this.Value += '-';
        else
            this.Value += Math.ceil(Math.random() * 16).toString(16);
    }
};
Guid.prototype.Empty = "0";