/* Javascript for MultiEngineXBlock. */

if(!MultiEngineXBlockState) var MultiEngineXBlockState = {};

function MultiEngineXBlock(runtime, element) {

    function success_func(result) {
        //console.log("Количество баллов: " + result.correct/result.weight*100 + " ОТВЕТОВ: " + result.attempts);
        $('.attempts', element).text(result.attempts);
        $(element).find('.weight').html('Набрано баллов: <me-span class="points"></span>');
        $('.points', element).text(result.correct + ' из ' + result.weight);

        if (result.max_attempts && result.max_attempts <= result.attempts) {
            $('.send_button', element).html('<p><strong>Попытки исчерпаны</strong></p>')
        };
    };


    function success_save(result){
    	var span = document.createElement('span');
    	span.innerHTML = 'Сохранено';
    	span.classList.add('saved');
        element.getElementsByClassName('action')[0].appendChild(span);
        setTimeout(function(){element.getElementsByClassName('saved')[0].parentNode.removeChild(element.getElementsByClassName('saved')[0])}, 1000);        
    };
    function success_check(result){
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: mengine.genJSON('answer', mengine.genAnswerObj()),
            success: success_func
        });    
    };

    
  
    var getStudentStateURL = runtime.handlerUrl(element,'get_student_state');
    var handlerUrl = runtime.handlerUrl(element, 'student_submit');
    var saveStudentStateURL = runtime.handlerUrl(element,'save_student_state');

    $(element).find('.Save').bind('click', function() {
        $.ajax({
            type: "POST",
            url: saveStudentStateURL,
            data: mengine.genJSON('state', mengine.genAnswerObj()),
            success: success_save
        });
    });

    $(element).find('.Check').bind('click', function() {
        $.ajax({
            type: "POST",
            url: saveStudentStateURL,
            data: mengine.genJSON('state', mengine.genAnswerObj()),
            success: success_check
        });

    });

    // Сценарий
    eval(scenarioJSON.javascriptStudent)

    MultiEngineXBlockState[mengine.id.valueOf()] = function(){
        console.log(mengine.studentStateJSON);
    };
}