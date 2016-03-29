/**
 * Main PCXBlock function in LMS scope.
 * @param {int} runtime The first number.
 * @param {int} element The second number.
 * @param {int} data The second number.
 * @returns {int} The sum of the two numbers.
 */
var PCXBlock = function PCXBlock (runtime, element, data) {

    var handlerUrl = runtime.handlerUrl(element, "student_submit");

    $("#workzone").mouseover(function workzoneMouseover () {

        $("body").css("overflow", "hidden");

    });

    $("#workzone").mouseout(function workzoneMouseOut () {

        $("body").css("overflow", "auto");

    });


    $(document).ready(function makeGrid () {

        if (window.World.Crafter.GridMode) {

            window.World.Drawer.SetStepGrid(data.grid_step);

        }

    });

    function successFunc (result) {

        // console.log("Количество баллов: " + result.correct/result.weight*100 + " ОТВЕТОВ: " + result.attempts);
        // $('.attempts', element).text(result.attempts);

        $(element).find(".weight").
        html("Набрано баллов: <me-span class=\"points\"></span>");
        $(".points", element).text(Math.round(result.points));
        onWindowResize()

    }

    $(element).find(".Check").
    bind("click", function check () {

	if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
        window.World.Draw();
        // drawResult();
       // var res = drawResult(),
        res = drawResult();
        showCompleteAlert();
        /*$('.ge_errorModal .modal-title').text('Ваше задание');
         $('.ge_errorModal').modal('show');*/


   // window.stop();

   /* $("#ololo").attr("src", res);
	$( "#dialog-confirm" ).dialog({
    	  resizable: false,
      	height:660,
      	modal: true,
      	buttons: {
        "Отправить": function() {
          	$.ajax({
            "type": "POST",
            "url": handlerUrl,
            "data": JSON.stringify({"picture": res }),
            "success": successFunc
        });

        	},
        "Не отправлять": function() {
          $( this ).dialog( "close" );
       


        }
      }
    });*/
    

    

         //   studentPicture = res;

      
    });

};
