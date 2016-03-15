function PCXBlockEdit(runtime, element) {
            window.EmptyImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
            window.minimimumOpacity = 0.1;
            window.headerHeight = 100;
            window.Config = {
                Wall: { height: 2.5 * 100, width: 2 }
            };
            var formatter = new Formatting.NumberFormatter(new Formatting.NumberFormatInfo());
            function onWindowResize() {
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
                     //   World.Drawer2D.reSizeCanvas();
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
            $('#workzone').on('click', '.ge_drawerButtons .ge_drawBottomLine', function () {
                $('.ge_drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('.ge_drawerButtons .ge_saveResult').show();
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetPlotMode(true);
            });
            $('#workzone').on('click', '.ge_drawerButtons .ge_drawLayers', function () {
                $('.ge_drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('.ge_drawerButtons .ge_saveResult').hide();
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetPlotMode(false);
            });
            
            $('#workzone').on('click', '.ge_drawerButtons .ge_saveResult', function () {
               if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
                window.World.Draw();
                $('.ge_gridMode').text("Убрать сетку");
            });

            $('.ge_task').click(function () {
                $('.ge_errorModal .modal-title').text('Ваше задание');
                $('.ge_errorModal').modal('show');
            });

            $( "#workzone" ).mouseout(function() {
                //console.log("mouse OUT!");
                $("body").css("overflow","auto");             
               // $( "#log" ).append( "Handler for .mouseout() called." );
            });

            $( "#workzone" ).mouseover(function() {
                $("modal-content").css("overflow","hidden");
                $("body").css("overflow","hidden")    
            });



            $('#lol').click(function () {
                
            //if (window.World.Crafter instanceof WallCrafter) 
                /*window.World.Crafter.SetResultMode(true);
                window.World.Draw();
                var res = window.World.SavedResult;
                console.log("PICTURE: " + res);*/
            });
        });

   console.log("studio js");
    $(".modal-content").css("height", 900);        
   

    $(element).find('.save-button').bind('click', function() {
        var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
            data = {
               /* display_name: $(element).find('input[name=display_name]').val(),
                question: $(element).find('input[name=question]').val(),
                weight: $(element).find('input[name=weight]').val(),
                correct_answer: $(element).find('input[name=correct_answer]').val(),
                max_attempts: $(element).find('input[name=max_attempts]').val(),
                backgroung_picture: $(element).find('input[name=backgroung_picture]').val()*/
            };

        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
            window.location.reload(false);
        });
    });

    $(element).find('.cancel-button').bind('click', function() {
        runtime.notify('cancel', {});
    });
}