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