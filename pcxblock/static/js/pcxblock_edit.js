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


    function readFile() {
      if (this.files && this.files[0]) {
        var FR = new FileReader();
        FR.onload = function(e) {
          $(element).find('input[name=background_image]')[0].value = e.target.result;
        };

        FR.readAsDataURL(this.files[0]);
      }
    };
    $(element).find('input[name=upload_image]')[0].addEventListener("change", readFile, false);
    


    var getGridStep = runtime.handlerUrl(element,'get_settings');

    console.log("Шаг сетки: " + get_settings);

    $(element).find('.save-button').bind('click', function() {
        var handlerUrl = runtime.handlerUrl(element, 'studio_submit'),
            data = {
                display_name: $(element).find('input[name=display_name]').val(),
                question: $(element).find('textarea[name=question]').val(),
                weight: $(element).find('input[name=weight]').val(),
                max_attempts: $(element).find('input[name=max_attempts]').val(),
                background_image: $(element).find('input[name=background_image]').val(),
                grid_step: $(element).find('input[name=grid_step]').val()
            };

        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
            window.location.reload(true);
        });
    });

    $(element).find('.cancel-button').bind('click', function() {
        runtime.notify('cancel', {});
    });
}