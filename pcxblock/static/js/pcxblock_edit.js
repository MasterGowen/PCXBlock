function PCXBlockEdit(runtime, element) {
            
    console.log("studio js");
    

    $( "#workzone" ).mouseover(function() {
        $("body").css("overflow","hidden")    
    });

    $( "#workzone" ).mouseout(function() {
        $("body").css("overflow","auto");            
    });

    $(".modal-content").css("height", 1070);        
    $(".modal-content").css("overflow","hidden");

    
    $(element).find('.save-button').bind('click', function() {
        var handlerUrl = runtime.handlerUrl(element, 'studio_submit'),
            data = {
                display_name: $(element).find('input[name=display_name]').val(),
                question: $(element).find('textarea[name=question]').val(),
                weight: $(element).find('input[name=weight]').val(),
            
                max_attempts: $(element).find('input[name=max_attempts]').val(),
                background_image: $(element).find('input[name=background_image]').val()
            };

        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
            window.location.reload(true);
        });
    });

    $(element).find('.cancel-button').bind('click', function() {
        runtime.notify('cancel', {});
    });
}