var gridStep  = 2;

function PCXBlockEdit(runtime, element, data) {
    console.log("studio js");
    
    /*function success_func(result) {
       gridStep = JSON.parse(result).grid_step;
       console.log("Шаг сетки venm: " + gridStep);
    };
    
    $.ajax({
            type: "POST",
            url: runtime.handlerUrl(element, 'get_settings'),
            success: success_func,
            data: JSON.stringify({"task": "get_settings"})
    });
*/

	if (typeof gridStep != 'undefined') {
		    gridStep = data.grid_step;
   			console.log("gridStep :" + gridStep); 
		}


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