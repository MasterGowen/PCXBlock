function PCXBlockEdit(runtime, element) {
   
   console.log("studio js");
    $(".modal-content").css("height",900);        
   

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