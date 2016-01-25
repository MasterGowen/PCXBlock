
function PCXBlock(runtime, element) {

    //console.log("lol");

    function get_student_picture(){
        var canvas = $('.designer canvas').get(0);
        var dataURL = canvas.toDataURL();
    }

    /*function success_func(result) {
        //console.log("Количество баллов: " + result.correct/result.weight*100 + " ОТВЕТОВ: " + result.attempts);
        $('.attempts', element).text(result.attempts);
        $(element).find('.weight').html('Набрано баллов: <me-span class="points"></span>');
        $('.points', element).text(result.correct + ' из ' + result.weight);

        if (result.max_attempts && result.max_attempts <= result.attempts) {
            $('.send_button', element).html('<p><strong>Попытки исчерпаны</strong></p>')
        };
    };*/


    function success_save(result){
    	var span = document.createElement('span');
    	span.innerHTML = 'Сохранено';
    	span.classList.add('saved');
        element.getElementsByClassName('action')[0].appendChild(span);
        setTimeout(function(){element.getElementsByClassName('saved')[0].parentNode.removeChild(element.getElementsByClassName('saved')[0])}, 1000);        
    };

    function success_check(result){
        console.log("success check!!!!");
       /* $.ajax({
            type: "POST",
            url: handlerUrl,
            data: '',
            success: success_func
        });    */
    };

    var handlerUrl = runtime.handlerUrl(element, 'student_submit');
    //var student_picture = get_student_picture();
    console.log("get_student_picture: ");// + student_picture);
    $(element).find('.Check').bind('click', function() {
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: '{"student_picture":'+student_picture+'}',
            success: success_check
        });

    });

}