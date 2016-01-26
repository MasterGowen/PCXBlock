function PCXBlockEdit(runtime, element) {
   

   console.log("fromhtml");
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
                $('.buttons').css("top", window.headerHeight);*/
                $('.designer-block').css("margin-left", $('.buttons').width());
                $('.designer-block').height(460);
               // $('.designer-block').css("margin-top", window.headerHeight);
                $('.designer-block').css("margin-right", 30);
                $('.sequence-bottom').css("visibility", "hidden");
                //$('.buttons').height($('html').height() - 90);
                $('.propertyPanel').height($('html').height() - window.headerHeight - 3);
                if (typeof World !== "undefined") {
                    if (typeof World.Drawer2D !== "undefined") {
                        World.Drawer2D.canvas.height = 400;
                        World.Drawer2D.canvas.width = $('.designer').width();
                    }
                }
            }
            var Meths = {
                reset: function () {
                    window.World.Objects.Walls = [];
                    window.World.Objects.Line = [];
                    window.World.Objects.Normals = [];
                    return false;
                },
                back: function () {
                    window.World.Crafter.KeyDown(27);
                    return false;
                },
                linetool: function () {
                   
                }
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
            };
            createDef();
            $('.designer')[0].oncontextmenu = function () { return false; };
           // window.addEventListener('resize', onWindowResize, false);
            window.World.Crafter = new WallCrafter();
           // onWindowResize();
            $('#linetool').addClass('active');
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
                var tool = $(this).attr('id');
                Meths[tool]();
            });
            
            $('body').on('click', '#drawerButtons #drawBottomLine', function () {
                $('#drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('#drawerButtons #saveResult').show();
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLineMode(true);
            });
            $('body').on('click', '#drawerButtons #drawLayers', function () {
                $('#drawerButtons .active').removeClass('active');
                $(this).addClass('active');
                $('#drawerButtons #saveResult').hide();
                if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetLineMode(false);
            });
            $('body').on('click', '#drawerButtons #saveResult', function () {
                var canvas = $('.designer canvas').get(0);
                // save canvas image as data url (png format by default)
                var dataURL = canvas.toDataURL();
               // console.log(dataURL);
                downloadCanvas(dataURL, 'result.png');
                
            });
            $('#task').click(function () {
                $('#errorModal .modal-title').text('Ваше задание');
                $('#errorModal').modal('show');
            });
           // console.log("acghsdbvhc")
        });
        function downloadCanvas(currDataURL, filename) {
            var link = document.createElement("a");
            link.href = currDataURL;
            link.download = filename;
            link.click();
        }
   

    $(element).find('.save-button').bind('click', function() {
        var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
            data = {
                display_name: $(element).find('input[name=display_name]').val(),
                question: $(element).find('input[name=question]').val(),
                weight: $(element).find('input[name=weight]').val(),
                correct_answer: $(element).find('input[name=correct_answer]').val(),
                max_attempts: $(element).find('input[name=max_attempts]').val(),
                backgroung_picture: $(element).find('input[name=backgroung_picture]').val()
            };

        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
            window.location.reload(false);
        });
    });

    $(element).find('.cancel-button').bind('click', function() {
        runtime.notify('cancel', {});
    });
}