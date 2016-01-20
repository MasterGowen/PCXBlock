function AddWheel(elem, onW) {
    var onWheel = function (e) {
        e = e || window.event;
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