            window.EmptyImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
            window.minimimumOpacity = 0.1;
            window.headerHeight = 100;
            window.Config = {
                Wall: { height: 2.5 * 100, width: 2 }
            };
            var formatter = new Formatting.NumberFormatter(new Formatting.NumberFormatInfo());
            function onWindowResize() {
                if (typeof World !== "undefined") {
                    if (typeof World.Drawer2D !== "undefined") {
                        if (World.Drawer2D.FullScreen) {
                            World.Drawer2D.canvas.height = screen.height;//$('.designer-block').height();
                            $('.designer').height(World.Drawer2D.canvas.height);
                        } 
                        else {
                            World.Drawer2D.canvas.height = 480;
                            $('.designer').height(World.Drawer2D.canvas.height);
                        }
                        
                        World.Drawer2D.canvas.width = $('.designer').width();
                        World.Drawer2D.reSizeCanvas();
                    }
                }
            }
            var Meths = {
                resettool: function () {
                    window.World.Objects.Walls = [];
                    window.World.Objects.Beziers = [];
                    window.World.Objects.Normals = [];
                    window.World.Objects.Arcs = [];
                    window.World.Objects.Curves = [];
                    return false;
                },
                backtool: function () {
                    window.World.Crafter.KeyDown(27);
                    return false;
                },
                benttool: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetBentMode();
                },
                linetool: function() {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLineMode();
                    $('div.linktool[rel^=p]').removeAttr('disabled');
                },
                beziertool: function() {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetBezierMode();
                },
                arctool: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetArcMode();
                },
                circletool: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetCircleMode();
                },
                smoothtool: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetSmoothMode();
                },
                walltool: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetWallMode();
                },
                mainline: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLineType("main");
                },
                dashdotline: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLineType("dashdot");
                },
                dashedline: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLineType("dashed");
                },
                thinline: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLineType("thin");
                },
                parallellink:function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLinkType("parallel");
                },
                perpendicularlink: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLinkType("perpendicular");
                },
                extremelink: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLinkType("extreme");
                },
                linepointlink: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLinkType("linepoint");
                },
                intersectionlink: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLinkType("intersection");
                },
            };

            $(document).ready(function () {
            window.quality = 30;
            window.World = new WorldClass($('.designer'));
            window.minimimumOpacity = 0.1;
            window.World.Crafter = new WallCrafter();
            window.World.SetMode(window.Modes.two);
            window.World.Drawer2D.setImage($('img.ge_taskImg').get(0));
            $('.designer')[0].oncontextmenu = function () { return false; };
            window.addEventListener('resize', onWindowResize, false);
            onWindowResize();
            $('[rel=benttool]').addClass('active');
            $('[rel=mainline]').addClass('active');
            $('div.linktool[rel^=p]').attr('disabled', true);
            $('.designer .controls').mousedown(function (event) {
                if (event.stopPropagation)
                    event.stopPropagation();
            });
            $('.designer .controls .left').mousedown(function (e) {
                window.World.Drawer.MoveLeft();
            });
            $('.designer .controls .right').mousedown(function (e) {
                window.World.Drawer.MoveRight();
            });
            $('.designer .controls .up').mousedown(function (e) {
                window.World.Drawer.MoveUp();
            });
            $('.designer .controls .down').mousedown(function (e) {
                window.World.Drawer.MoveBottom();
            });
            $('.designer .controls .zoom-in').mousedown(function (e) {
                window.World.Drawer.ScaleDown();
            });
            $('.designer .controls .zoom-out').mousedown(function (e) {
                window.World.Drawer.ScaleUp();
            });
            $('.buttons div').click(function () {
                if ($(this).hasClass('tool')) {
                    $('.buttons div').removeClass('active');
                    $('div.tool').removeClass('active');
                    $('div.linktool').removeClass('active');
                    $('div.linktool[rel^=p]').attr('disabled',true);
                    $(this).addClass('active');
                }
                if (!$(this).hasClass('extend-tool')) {
                    var tool = $(this).attr('rel');
                    Meths[tool]();
                }
            });

            $('div.linktool').click(function () {
                if ($(this).hasClass('linktool') && $(this).not('[disabled]')) {
                    $('div.linktool').removeClass('active');
                    $(this).addClass('active');

                }
                var tool = $(this).attr('rel');
                Meths[tool]();
            });
            
            $('.ge_gridMode').click(function () {
                var gridMode = window.World.Crafter.GetGridMode();
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetGridMode(!gridMode);
            });

            $('body').on('click', '.ge_drawerButtons .ge_drawBottomLine', function () {
                $('.ge_drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('.ge_drawerButtons .ge_saveResult').show();
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetPlotMode(true);
                $('.d2d').hide();
                $('.ge_panel').hide();
                $('.lines-types').show();
                
            });
            $('body').on('click', '.ge_drawerButtons .ge_drawLayers', function () {
                $('.ge_drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('.ge_drawerButtons .ge_saveResult').hide();
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetPlotMode(false);
                $('.d2d').show();
                $('.ge_panel').show();
                $('.lines-types').hide();
            });
            $('body').on('click', '.ge_drawerButtons .ge_saveResult', function () {
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
                window.World.Draw();
                onWindowResize();
            });

        });
        
        
         document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;

        function onFullScreenEnter() {
            window.World.Drawer.fullModeScreen(1);
        };

        function onFullScreenExit() {
            window.World.Drawer.fullModeScreen(0);
        };

        function enterFullscreen(id) {
            onFullScreenEnter(id);
            var el = document.getElementById(id);
            var onfullscreenchange = function (e) {
                var fullscreenElement = document.fullscreenElement || document.mozFullscreenElement || document.webkitFullscreenElement;
                var fullscreenEnabled = document.fullscreenEnabled || document.mozFullscreenEnabled || document.webkitFullscreenEnabled;
                console.log('fullscreenEnabled = ' + fullscreenEnabled, ',  fullscreenElement = ', fullscreenElement, ',  e = ', e);
                onWindowResize();
            }

            el.addEventListener("webkitfullscreenchange", onfullscreenchange);
            el.addEventListener("mozfullscreenchange", onfullscreenchange);
            el.addEventListener("fullscreenchange", onfullscreenchange);

            if (el.webkitRequestFullScreen) {
                el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            } else {
                el.mozRequestFullScreen();
            }
            document.querySelector('#' + id + ' .ge_zoom').onclick = function () {
                exitFullscreen(id);
            }
        }

        function exitFullscreen(id) {
            onFullScreenExit(id);
            document.cancelFullScreen();
            document.querySelector('#' + id + ' .ge_zoom').onclick = function () {
                enterFullscreen(id);
            }
        }
        var drawResult = function () {
            if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
            window.World.Draw();
        };