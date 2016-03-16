function PCXBlock(runtime, element) {

    












    $( "#workzone" ).mouseover(function() {
        $("body").css("overflow","hidden")    
    });

    $( "#workzone" ).mouseout(function() {
        $("body").css("overflow","auto");            
    });
    //console.log("lol");

    /*function get_student_picture(){
        if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
                window.World.Draw();
       // if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
        //var dataURL = getResult();
        //console.log(dataURL);
        return dataURL;
    }*/

    function success_func(result) {
        //console.log("Количество баллов: " + result.correct/result.weight*100 + " ОТВЕТОВ: " + result.attempts);
        //$('.attempts', element).text(result.attempts);
        $(element).find('.weight').html('Набрано баллов: <me-span class="points"></span>');
        $('.points', element).text(result.points );
    };


    /*function success_save(result){
        var span = document.createElement('span');
        span.innerHTML = 'Сохранено';
        span.classList.add('saved');
        element.getElementsByClassName('action')[0].appendChild(span);
        setTimeout(function(){element.getElementsByClassName('saved')[0].parentNode.removeChild(element.getElementsByClassName('saved')[0])}, 1000);        
    };*/

    /*function success_check(result){ge_saveResultge_saveResult
        console.log("success_check");*/
       /* $.ajax({
            type: "POST",
            url: handlerUrl,
            data: '',
            success: success_func
        });    */
    /*};*/

    var handlerUrl = runtime.handlerUrl(element, 'student_submit');

    $(element).find('.Check').bind('click', function() {
        if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
                window.World.Draw();
        window.World.Crafter.SetResultMode(true);
        var student_picture = String(window.World.SavedResult);
       /*var student_picture = getResult();*/
       console.log("get_student_picture: " + student_picture);
        
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({picture: student_picture }),
            success: success_func
        });

    });

}