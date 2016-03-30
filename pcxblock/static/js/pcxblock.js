/**
 * Main PCXBlock function in LMS scope.
 * @param {int} runtime The first number.
 * @param {int} element The second number.
 * @param {int} data The second number.
 * @returns {int} The sum of the two numbers.
 */
var PCXBlock = function PCXBlock (runtime, element, data) {

    var handlerUrl = runtime.handlerUrl(element, "student_submit");

    $(element).find("#ge_canvas").mouseover(function workzoneMouseover () {
        disableScroll();
    });
    $(element).find("#ge_canvas").mouseout(function workzoneMouseOut () {
        enableScroll();
    });


    $(document).ready(function makeGrid () {
        
        if (window.World.Crafter.GridMode) {
            window.World.Drawer.SetStepGrid(data.grid_step);
        }

        $(element).find("#background_check_picture").attr("src", $(element).find(".ge_taskImg").prop('src'))
    });

    function successFunc (result) {
        
        $('.attempts', element).text(result.attempts);
        $(element).find(".weight").
        html("Набрано баллов: <me-span class=\"points\"></span>");

        $(".points", element).text(Math.round(result.points));
        closeCompleteAlert();

    }
    
    function showCompleteAlert(){
        $('#pcoverlay').fadeIn('fast', function(){
        $('#pcbox').fadeIn('fast', function(){});
        disableScroll();
        //$("body").css("overflow","hidden");
      });
    }

    function closeCompleteAlert(){
        $('#pcoverlay').fadeOut('fast', function(){
        $('#pcbox').fadeOut('fast', function(){});
        enableScroll();
        //$("body").css("overflow","auto");
      });
    }

    $('#close_modal_button').click(function () {
			closeCompleteAlert();
    });

    $(function() {

    $( ".buttons.d2d" ).draggable();

  });

    $(element).find(".Check").
    bind("click", function check () {

	if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
        window.World.Draw();
        var res = drawResult();

        $('#student_check_picture').attr("src", res);

        showCompleteAlert();

         $('#send_answer').click(function () {
			$.ajax({
            	"type": "POST",
            	"url": handlerUrl,
            	"data": JSON.stringify({"picture": res }),
            	"success": successFunc
        	});
    	
    	});



      
    });

};
