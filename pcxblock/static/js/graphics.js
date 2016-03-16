            window.EmptyImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
            window.minimimumOpacity = 0.1;
            window.headerHeight = 100;
            window.Config = {
                Wall: { height: 2.5 * 100, width: 2 }
            };
            var formatter = new Formatting.NumberFormatter(new Formatting.NumberFormatInfo());
            function onWindowResize() {
                /*$('.leftMenu').css("height", window.headerHeight);
                $('.leftMenu .logo').css("height", window.headerHeight);
                $('.leftMenu .photo img').css("height", window.headerHeight*0.70);
                $('.leftMenu .button').css("padding-top", window.headerHeight / 3);
                $('.leftMenu .button').css("height", 2 * window.headerHeight / 3);
                $('.buttons').css("top", window.headerHeight);
                $('.designer-block').css("margin-left", $('.buttons').width());
                $('.designer-block').height($('#workzone').height() - window.headerHeight);
                $('.designer-block').css("margin-top", window.headerHeight);
                $('.designer-block').css("margin-right", 30);
                $('.buttons').height($('#workzone').height() - 90);
                $('.propertyPanel').height($('#workzone').height() - window.headerHeight - 3);*/

                console.log('RESIIIIIIIIIIIIIIIIZE!');
                $('.leftMenu').css("height", window.headerHeight);
                $('.leftMenu .logo').css("height", window.headerHeight);
                $('.leftMenu .photo img').css("height", window.headerHeight*0.70);
                $('.leftMenu .button').css("padding-top", window.headerHeight / 3);
                $('.leftMenu .button').css("height", 2 * window.headerHeight / 3);
                $('.buttons').css("top", window.headerHeight);
                $('.designer-block').css("margin-left", 75);
                $('.designer-block').height(600);
                $('.designer-block').css("margin-top", 0);
                $('.designer-block').css("margin-right", 30);
                $('.designer').css("margin-top",75);
                $('.buttons').height(525);
                $('.propertyPanel').height($('html').height() - window.headerHeight - 3);
                if (typeof World !== "undefined") {
                    if (typeof World.Drawer2D !== "undefined") {
                        if (World.Drawer2D.FullScreen) {
                            World.Drawer2D.canvas.height = $('.designer').height();
                        } else {
                            World.Drawer2D.canvas.height = $('.designer-block').height() - 120;
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
                },
                beziertool: function() {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetBezierMode();
                },
                walltool: function () {
                    if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetWallMode();
                },
            };

            $(document).ready(function () {
            window.quality = 30;
            var createDef = function () {
                window.World = new WorldClass($('.designer'));
                window.minimimumOpacity = 0.1;
                onWindowResize();
                window.World.Crafter = new Move2DCrafter();
                $('.buttons.d2d').css('display', 'block');
                window.World.SetMode(window.Modes.two);
                window.World.Drawer2D.setImage($('img.ge_taskImg').get(0));
            };
            createDef();
            $('.designer')[0].oncontextmenu = function () { return false; };
            window.addEventListener('resize', onWindowResize, false);
            window.World.Crafter = new WallCrafter();
            onWindowResize();
            $('[rel=benttool]').addClass('active');
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
                    $(this).addClass('active');
                }
                var tool = $(this).attr('rel');
                Meths[tool]();
            });

            

            $('.ge_gridMode').click(function () {
                var gridMode = window.World.Crafter.GetGridMode();
                $(this).text(!gridMode?"Убрать сетку":"Показать сетку");
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetGridMode(!gridMode);
            });
            $('body').on('click', '.ge_drawerButtons .ge_drawBottomLine', function () {
                $('.ge_drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('.ge_drawerButtons .ge_saveResult').show();
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetPlotMode(true);
            });
            $('body').on('click', '.ge_drawerButtons .ge_drawLayers', function () {
                $('.ge_drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('.ge_drawerButtons .ge_saveResult').hide();
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetPlotMode(false);
            });
            $('body').on('click', '.ge_drawerButtons .ge_saveResult', function () {
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
                window.World.Draw();
                $('.ge_gridMode').text("Убрать сетку");
                onWindowResize();
                console.log(getResult());
               // console.log("ok!");
            });

            $('.ge_task').click(function () {
                $('.ge_errorModal .modal-title').text('Ваше задание');
                $('.ge_errorModal').modal('show');
            });

            

            

        });

        
        var getResult = function() {
            return window.World.SavedResult;
        };

        
        

        
        document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;

        function onFullScreenEnter() {
            console.log("Enter fullscreen initiated from iframe");
            
            window.World.Drawer.fullModeScreen(1);
        };

        function onFullScreenExit() {
            console.log("Exit fullscreen initiated from iframe");
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