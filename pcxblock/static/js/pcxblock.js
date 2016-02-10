function PCXBlock(runtime, element) {

        alert("js load");
        console.log(element);


    

    /*function success_func(result) {
        //console.log("Количество баллов: " + result.correct/result.weight*100 + " ОТВЕТОВ: " + result.attempts);
        //$('.attempts', element).text(result.attempts);
        $(element).find('.weight').html('Набрано баллов: <me-span class="points"></span>');
        $('.points', element).text(result.points );
    };
*/

    /*function success_save(result){
        var span = document.createElement('span');
        span.innerHTML = 'Сохранено';
        span.classList.add('saved');
        element.getElementsByClassName('action')[0].appendChild(span);
        setTimeout(function(){element.getElementsByClassName('saved')[0].parentNode.removeChild(element.getElementsByClassName('saved')[0])}, 1000);        
    };*/

    /*function success_check(result){
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
       var student_picture = "lol"
       console.log("get_student_picture: " + student_picture);
        
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({picture: student_picture }),
           // success: success_func
        });

    });

}