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

    /* function get_student_picture(){
        if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
                window.World.Draw();
       // if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
        //var dataURL = getResult();
        //console.log(dataURL);
        return dataURL;
    }*/

    function successFunc (result) {

        // console.log("Количество баллов: " + result.correct/result.weight*100 + " ОТВЕТОВ: " + result.attempts);
        // $('.attempts', element).text(result.attempts);

        $(element).find(".weight").
        html("Набрано баллов: <me-span class=\"points\"></span>");
        $(".points", element).text(Math.round(result.points));
       // onWindowResize();

    }


    /* function success_save(result){
        var span = document.createElement('span');
        span.innerHTML = 'Сохранено';
        span.classList.add('saved');
        element.getElementsByClassName('action')[0].appendChild(span);
        setTimeout(function(){element.getElementsByClassName('saved')[0].parentNode.removeChild(element.getElementsByClassName('saved')[0])}, 1000);
    };*/

    /* function success_check(result){ge_saveResultge_saveResult
        console.log("success_check");*/
       /* $.ajax({
            type: "POST",
            url: handlerUrl,
            data: '',
            success: successFunc
        });    */
    /* };*/


    $(element).find(".Check").
    bind("click", function check () {

        /* if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
            window.World.Draw();
        $('.ge_gridMode').text("Убрать сетку");*/

        // drawResult();
        var res = drawResult(),
        // res = getResult();

            studentPicture = res;

        $.ajax({
            "type": "POST",
            "url": handlerUrl,
            "data": JSON.stringify({"picture": studentPicture}),
            "success": successFunc
        });

    });

};
