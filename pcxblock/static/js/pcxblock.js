/**
 * Main PCXBlock function in LMS scope.
 * @param {int} runtime The first number.
 * @param {int} element The second number.
 * @param {int} data The second number.
 * @returns {int} The sum of the two numbers.
 */

var show_background = true;
var resultImage;
var monoResultImage;

var PCXBlock = function PCXBlock (runtime, element, data) {

    var handlerUrl = runtime.handlerUrl(element, "student_submit");


    $(element).find("#ge_canvas").mouseover(function workzoneMouseover () {
        disableScroll();
    });

    $(element).find("#ge_canvas").mouseout(function workzoneMouseOut () {
        enableScroll();
    });

    $('#close_modal_button').click(function () {
            closeCompleteAlert();
    });

    $(element).find(".ge_drawBottomLine").click(function () {
            $(element).find("button.check").removeClass( "disabled" );
    });
    $(element).find(".ge_drawLayers").click(function () {
            $(element).find("button.check").addClass( "disabled" );
    });


    $('.show-hide-background').click(function () {
        $(this).text(!show_background?"Скрыть фон":"Показать фон");
        if(show_background){
            $(element).find("#background_check_picture").css( "display", "none" );
            show_background = false;
        }
        else{
            $(element).find("#background_check_picture").css( "display", "block" );
            show_background = true;
        }
    });


    $(document).ready(function makeGrid () {
       $(element).find("button.check").addClass( "disabled" );
        if (window.World.Crafter.GridMode) {
            window.World.Drawer.SetStepGrid(data.grid_step);
        }
        $(element).find("#background_check_picture").attr("src", $(element).find(".ge_taskImg").prop('src'));
    });

    function successFunc (result) {
        closeCompleteAlert();

        if(result.success_status == "ok"){
            $('#send_answer').text("Проверить");
            $('.attempts', element).text(result.attempts);
            $(element).find('.weight').html('Набрано баллов: <me-span class="points"></span>');
            $('.points', element).text(result.points + ' из ' + result.weight);
            if (result.max_attempts && result.max_attempts <= result.attempts) {
                $('.action', element).html('<p><strong>Попытки исчерпаны</strong></p>')
            };
        }
        if(result.success_status == "error"){
            $('#send_answer').text("Проверить");
            alert("При проверке задания возникла ошибка! Попробуйте отправить задание на проверку еще раз. Если это не помогло - обновите страницу.");
        }

    }
    
    function showCompleteAlert(){

        $('#pcoverlay').fadeIn('fast', function(){

        setResultImage();
        $('#student_check_picture').attr("src", monoResultImage);
        $('#pcbox').fadeIn('fast', function(){});
        disableScroll();
        onWindowResize();
      });
    }

    function closeCompleteAlert(){
        $('#pcoverlay').fadeOut('fast', function(){
        $('#pcbox').fadeOut('fast', function(){});
        enableScroll();
      });
    }

    function setResultImage(){
        resultImage = globalImage;
        monoResultImage = drawMonoResult();
    }



    /*$(function() {
        $(element).find(".all-tools").draggable({ handle: "div.tools-drag-handle", containment: ".content-wrapper", scroll: false});
    });*/

    $(element).find(".Check").
    bind("click", function check () {
	if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
        window.World.Draw();
        drawResult();
        showCompleteAlert();
    });

    $(element).find('#send_answer').click(function () {
        $('#send_answer').text("Проверка ...")
        $.ajax({
            "type": "POST",
            "url": handlerUrl,
            "data": JSON.stringify({"picture": resultImage }),
            "success": successFunc,
    });
    });

};
